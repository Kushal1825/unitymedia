import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { Follow } from "../models/follow.model.js";

const toggleFollow = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    

    const verifyUser = await User.findById(userId);

    if (!verifyUser) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "User doesn't exist"));
    }
    // console.log(verifyUser);
    

    const FindRequest = await Notification.findOne({
      user_id: verifyUser._id,
      sender_id: req.user._id,
      notification_type: "follow_request",
    });
    // console.log(FindRequest);
    
    if(FindRequest){

      await Notification.findOneAndDelete({
        user_id: verifyUser._id,
        sender_id: req.user._id,
        notification_type: "follow_request",
      });
      return res.status(200).json(new ApiResponse(200,null,"Request cancel"))
    }
    const verifyFollow = await Follow.findOne({
      follower_id: req.user?._id,
      following_id: verifyUser?._id,
    });

    if (verifyFollow) {
      await Follow.findOneAndDelete({
        follower_id: req.user?._id,
        following_id: verifyUser._id,
      });

      await Notification.findOneAndDelete({
        user_id: verifyUser._id,
      sender_id: req.user._id,
      notification_type: "follow",
      })
      
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Unfollow User Successfully"));
    }

    if (verifyUser.is_private) {
      const findRequest = await Notification.findOne({
        sender_id: req.user._id,
        user_id: verifyUser._id,
        notification_type: "follow_request",
      });

      if (findRequest) {
        return res
          .status(300)
          .json(new ApiResponse(205, null, "Request is already placed"));
      }

      const notification = await Notification.create({
        user_id: verifyUser._id,
        notification_type: "follow_request",
        sender_id: req.user._id,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, null, "Follow Request placed Successfully"));
    } else {
      const newFollow = await Follow.create({
        follower_id: req.user._id,
        following_id: verifyUser._id,
      });

      if(verifyUser.notificationSettings.follow==="all"){
              const notification = await Notification.create({
                user_id: verifyUser._id,
                sender_id: req.user._id,
                notification_type: "follow",
              });
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Followed successfully"));
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const acceptFollowRequest = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const followingUser = await User.findById(userId);

    if (!followingUser) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not exists"));
    }
    const currentUser = req.user?._id.toString();
    // console.log(userId, currentUser);

    const findRequest = await Notification.findOne({
      sender_id: userId,
      user_id: currentUser,
      notification_type: "follow_request",
    });
    console.log(findRequest);

    if (!findRequest) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Request is not exists"));
    }

    const newFollow = await Follow.create({
      follower_id: followingUser._id,
      following_id: req.user?._id,
    });

    await Notification.findOneAndDelete({
      sender_id: userId,
      user_id: currentUser,
      notification_type: "follow_request",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Request Accepted successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const cancelRequest = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const followingUser = await User.findById(userId);

    if (!followingUser) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not exists"));
    }

    const findRequest = await Notification.findOneAndDelete({
      sender_id: followingUser._id,
      user_id: req.user?._id,
      notification_type: "follow_request",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Request Canceled successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getFollowerList = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const lowerUserName = username.toLowerCase();

    const user = await User.findOne({ username: lowerUserName });

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Username is not exists"));
    }

    const followers = await Follow.find({
      following_id: user?._id,
    });

    const followerList = followers.map((user) => user.follower_id);
    // console.log(followerList);

    const userFollowers = await User.aggregate([
      {
        $match: {
          _id: {
            $in: followerList,
          },
          blockList: {
            $nin: [user?._id],
          },
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "following_id",
          as: "followers",
        },
      },
      {
        $addFields: {
          isFollow: {
            $cond: {
              if: { $in: [user?._id, "$followers.follower_id"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          bio: 1,
          postCount: 1,
          followerCount: 1,
          followingCount: 1,
          isFollow: 1,
          avatar: 1,
          email: 1,
          hasFollowReqest: 1,
        },
      },
    ]);
    // console.log(userFollowers);

    // console.log(Followers);

    res
      .status(200)
      .json(new ApiResponse(200, userFollowers, "User follower list"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getFollowingList = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const lowerUserName = username.toLowerCase();

    const user = await User.findOne({ username: lowerUserName });

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Username is not exists"));
    }

    const followers = await Follow.find({
      follower_id: user?._id,
    });

    const followingList = followers.map((user) => user.following_id);
    // console.log(followingList);

    const userFollowers = await User.aggregate([
      {
        $match: {
          _id: {
            $in: followingList,
          },
          blockList: {
            $nin: [user?._id],
          },
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "follower_id",
          as: "followers",
        },
      },
      {
        $addFields: {
          isFollow: {
            $cond: {
              if: { $in: [user?._id, "$followers.following_id"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          bio: 1,
          postCount: 1,
          followerCount: 1,
          followingCount: 1,
          isFollow: 1,
          avatar: 1,
          email: 1,
          hasFollowReqest: 1,
        },
      },
    ]);
    // console.log(userFollowers);

    // console.log(Followers);

    res
      .status(200)
      .json(new ApiResponse(200, userFollowers, "User follower list"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});


export {
  toggleFollow,
  acceptFollowRequest,
  cancelRequest,
  getFollowerList,
  getFollowingList,
};
