import { Like } from "../models/like.model.js";
import { Notification } from "../models/notification.model.js";
import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";

const togglePostLike = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const findPost = await Post.findById(postId);

    const postOwner = await User.findById(findPost.user_id);

    // console.log("Like toggle");
    

    if (!findPost) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid Post Id"));
    }
    const isLiked = await Like.findOne({
      $and: [{ user_id: req.user?._id }, { post_id: findPost?._id }],
    });

    if (isLiked) {
      await Like.findByIdAndDelete(isLiked._id);
    } else {
      const like = await Like.create({
        post_id: postId,
        user_id: req.user?._id,
      });
      // console.log(like,"Like has been created");

      

      if (postOwner.notificationSettings.like === "all") {
        await Notification.create({
          user_id: findPost.user_id,
          post_id: like.post_id,
          notification_type: "like",
          sender_id: like.user_id,
        });
      } else if (postOwner.notificationSettings.like === "following") {
        const isFollowed = await Follow.findOne({
          following_id: req.user?._id,
          follower_id: postOwner._id,
        });

        if (isFollowed) {
          await Notification.create({
            user_id: findPost.user_id,
            post_id: like.post_id,
            notification_type: "like",
            sender_id: like.user_id,
          });
        }
      } else {
      }
    }


   
    

    return res.status(200).json(new ApiResponse(200, {message:"Like toggle successfully"}, "Toggle Like"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const findComment = await Comment.findById(commentId);

    const postOwner = await User.findById(findComment.author);

    if (!findComment) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid Comment Id"));
    }
    const isLiked = await Like.findOne({
      $and: [{ user_id: req.user?._id }, { comment_id: findComment?._id }],
    });

    if (isLiked) {
      await Like.findByIdAndDelete(isLiked._id);
    } else {
      const like = await Like.create({
        comment_id: commentId,
        user_id: req.user?._id,
      });

      
    }


    return res
      .status(200)
      .json(new ApiResponse(200, {message:'Comment toggle successfully'}, "Toggle Like"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const toggleStoryLike = asyncHandler(async (req, res) => {
  try {
    const { storyId } = req.params;

    const verifyStory = await Story.findById(storyId);

    if (!verifyStory) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid Story Id "));
    }

    const findLike = await Like.findOne({
      story_id: storyId,
      user_id: req.user?._id,
    });

    if (findLike) {
      await Like.findByIdAndDelete(findLike._id);
      
    } else {
       await Like.create({
        story_id: storyId,
        user_id: req.user?._id,
      });
      
    }

    const story = await Story.aggregate([
      {
        $match: {
          _id: verifyStory._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "story_id",
          as: "likes",
        },
      },
      {
        $addFields: {
          author: {
            $first: "$author",
          },
          
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, "$likes.user_id"],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          author: {
            username: 1,
            avatar: 1,
            _id: 1,
          },
          isLike: 1,
          duration: 1,
          media_url: 1,
          views: 1,
          expires_at: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, story, "toggle Like Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Internal server Error"));
  }
});

export { togglePostLike, toggleCommentLike, toggleStoryLike };
