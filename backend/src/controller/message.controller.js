import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { Post } from "../models/post.model.js";
import { getRecipientSocketId, io } from "../socket/socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { recipientId, message } = req.body;

    const senderId = req.user._id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessage: {
          content: message,
          sender: senderId,
        },
      });
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      content: message,
    });

    await Promise.all([
      conversation.updateOne({
        lastMessage: {
          content: message,
          sender: senderId,
        },
      }),
    ]);

    const recipientSocketId = getRecipientSocketId(recipientId);

    if (recipientSocketId) {
      const latestMessage = await Message.findById(newMessage._id).populate({
        path: "sender",
        select: "username avatar _id",
      });
      io.to(recipientSocketId).emit("newMessage", latestMessage);
    }

    res.status(201).json(new ApiResponse(201, newMessage, "Send Successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Errors"));
  }
});

const sharePost = asyncHandler(async (req, res) => {
  try {
    const { recipientId, postId } = req.body;

    const senderId = req.user._id;
    const post = await Post.findById(postId).populate("user_id");

    if (!post) {
      return req
        .status(400)
        .json(new ApiResponse(400, null, "Post cannot send"));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, recipientId],
        lastMessage: {
          text: `Sent a reel by ${post.user_id.username}`,
          sender: senderId,
        },
      });
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      post_id: post._id,
      content: " ",
    });

    await Promise.all([
      conversation.updateOne({
        lastMessage: {
          content: `Sent a reel by ${post.user_id.username}`,
          sender: senderId,
        },
      }),
    ]);

    res.status(201).json(new ApiResponse(201, newMessage, "Send Successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Errors"));
  }
});

const getMessages = asyncHandler(async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user?._id;

    const conversation = await Conversation.findOne({
      participants: {
        $all: [userId, otherUserId],
      },
    });

    if (!conversation) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Conversation not found"));
    }

    const messages = await Message.aggregate([
      {
        $match: {
          conversationId: conversation._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
          pipeline: [
            {
              $project: {
                _id: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "post_id",
          foreignField: "_id",
          as: "post",
          pipeline: [
            {
              $project: {
                _id: 1,
                image: 1,
                user_id: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          sender: {
            $first: "$sender",
          },
          post: {
            $first: "$post",
          },
        },
      },
    ]);

    res.status(200).json(new ApiResponse(200, messages, "Message is created"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getConversation = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    const conversation = await Conversation.find({
      participants: userId,
    }).populate({
      path: "participants",
      select: "_id username avatar is_blocked",
    });

    //remove the curren user from the participants array

    conversation.forEach((conversation) => {
      conversation.participants = conversation.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
    });
    // console.log(conversation);
    
    const filteredConversations = conversation.filter((conv) =>
      conv.participants.some((participant) => !participant.is_blocked)
    );
    // conversation

    res
      .status(200)
      .json(
        new ApiResponse(200, filteredConversations, "Conversation fetch successfully")
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, error.message, "Invalid Post Id"));
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  try {
    const { messageId, recipientId } = req.params;
  
    // Find the message by ID
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res
        .status(200)
        .json(new ApiResponse(404, null, "Message does not exist"));
    }
  
    // Check if the sender is the current user
    if (message.sender.toString() !== req.user?._id.toString()) {
      return res
        .status(200)
        .json(new ApiResponse(401, null, "You cannot delete this message"));
    }
  
    // Delete the message
    const response = await Message.findByIdAndDelete(messageId);
    
    if (!response) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Error while deleting the message"));
    }
  
    // Log the successful deletion of the message
    console.log(`Message with ID ${messageId} deleted`);
  
    // Get the recipient's socket ID
    console.log(recipientId);
    const recipientSocketId = getRecipientSocketId(recipientId);
    
  
    const lastMessage = await Message.findOne({
      conversationId: message.conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(1)
      .populate({
        path: "sender",
        select: "username avatar _id",
      });
    if (recipientSocketId) {
      // Find the last message in the conversation after deletion
  
      // console.log('Last message:', lastMessage);
  
      // Update the conversation with the last message
      if (lastMessage) {
         await Conversation.updateOne(
          { _id: message.conversationId },
          {
            $set: {
              "lastMessage.content": lastMessage.content,
              "lastMessage.sender": lastMessage.sender?._id,
            },
          }
        );
        // console.log('Conversation update result:', updateResult);
      } else {
         await Conversation.updateOne(
          { _id: message.conversationId },
          { $unset: { lastMessage: {} } }
        );
        // console.log('Conversation update result (no last message):', updateResult);
      }
  
      // Emit the update to the recipient's socket
      io.to(recipientSocketId).emit("MessageRemove", {
        messageId,
        lastMessage,
      });
    }
  
    // Return a success response
    return res
      .status(200)
      .json(new ApiResponse(200,{lastMessage: lastMessage || null}, "Message deleted successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, error.message, "Server Error"));
  }
  
});

export { sendMessage, getMessages, getConversation, deleteMessage, sharePost };
