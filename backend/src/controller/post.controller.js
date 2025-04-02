import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Follow } from "../models/follow.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Notification } from "../models/notification.model.js";

const createPost = asyncHandler(async (req, res) => {
  try {
    const { caption } = req.body;
    // console.log(req.file);

    const postImageLocalPath = req.file?.path;

    if (!postImageLocalPath) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Post Image Required"));
    }
    // console.log("local file availage");

    const postImage = await uploadOnCloudinary(postImageLocalPath);

    if (!postImage) {
      return res
        .status(200)
        .json(new ApiResponse(500, null, "Error while upload the Image"));
    }
    const user = await User.findById(req.user._id);

    const newPost = await Post.create({
      image: postImage.secure_url,
      user_id: user._id,
      caption,
    });

    // console.log(newPost);

    return res
      .status(200)
      .json(new ApiResponse(200, newPost, "Post created Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getPostById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // const post = await Post.findById(id);

    if (!id) {
      return res.status(200).json(new ApiResponse(400, null, "Id required"));
    }

    const post = await Post.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
          pipeline:[
            {
              $match:{
                is_blocked:false
              }
            }
          ]
        },
      },
      {
        $match: {
          author: { $ne: null },
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "user_id",
          foreignField: "following_id",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
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
          isFollow: {
            $cond: {
              if: {
                $in: [req.user?._id, "$followers.follower_id"],
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
            _id: 1,
            username: 1,
            fullName: 1,
            email: 1,
            avatar: 1,
          },
          image: 1,
          caption: 1,
          view: 1,
          comments: 1,
          likes: 1,
          isLike: 1,
          isFollow: 1,
          createdAt: 1,
        },
      },
    ]);

    if (!post) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "No such Post Exists"));
    }
    res
      .status(200)
      .json(new ApiResponse(200, post[0], "Post Fetch Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getRandomPost = asyncHandler(async (req, res) => {
  try {
    let { postIds } = req.body || [];
    const getUserFollowingList = await Follow.find({
      follower_id: req.user?._id,
    });

    const followingIds = getUserFollowingList.map((follower) => {
      return follower.following_id;
    });
    const oldPosts = await Post.find({ _id: { $in: postIds } });
    // console.log(oldPosts);
    const oldPostsIds = oldPosts.map((post) => post._id);
    const hasFollowing = followingIds.length > 0;

    const post = await Post.aggregate([
      {
        $match: hasFollowing
          ? {
              $and: [
                { user_id: { $in: followingIds } },
                { _id: { $nin: oldPostsIds } },
                { user_id: { $ne: req.user._id } },
              ],
            }
          : {
              $and: [
                { _id: { $nin: oldPostsIds } },
                { user_id: { $ne: req.user._id } },
              ],
            },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $match: {
                is_blocked:false,
                blockList: {
                  $nin: [req.user?._id],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, "$likes.user_id"],
              },
              then: true,
              else: false,
            },
          },
          author: {
            $first: "$author",
          },
        },
      },
      {
        $match: {
          author: { $ne: null },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $sample: {
          size: 5,
        },
      },
      {
        $project: {
          author: {
            password: 0,
            refreshToken: 0,
            emailVerifyCode: 0,
            emailVerifyCodeExpires: 0,
          },
          user_id: 0,
        },
      },
    ]);
    // console.log("Hello world");

    // console.log(post);

    let newPostsId = post.map((post) => post._id);

    newPostsId.map(async function (postId) {
      const post = await Post.findById(postId);
      post.view = post.view + 1;
      await post.save();
    });

    postIds = [...newPostsId, ...postIds];

    if (!post) {
      return res
        .status(200)
        .json(
          new ApiResponse(400, null, "Please Follow Somebudy to get Posts")
        );
    }

    res
      .status(200)
      .json(new ApiResponse(200, { post, postIds }, "Post Fetch Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getPostByUsername = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    // const post = await Post.findById(id);

    if (!username) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Username is required"));
    }
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "No such a user exists"));
    }

    const post = await Post.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user?._id),
          
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
          pipeline:[
            {$match:{
              is_blocked:false
            }}
          ]
        },
      },
     
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, "$likes.user_id"],
              },
              then: true,
              else: false,
            },
          },
          author: {
            $first: "$author",
          },
        },
      },
      {
        $match:{
          author:{$ne:null}
        }
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          author: {
            password: 0,
            refreshToken: 0,
          },
          user_id: 0,
        },
      },
    ]);

    if (!post) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "No such Post Exists"));
    }
    res.status(200).json(new ApiResponse(200, post, "Post Fetch Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getMyPost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(req.user?._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
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
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, "$likes.user_id"],
              },
              then: true,
              else: false,
            },
          },
          author: {
            $first: "$author",
          },
        },
      },
      {
        $project: {
          author: {
            password: 0,
            refreshToken: 0,
          },
          user_id: 0,
        },
      },
    ]);

    if (!post) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "No such Post Exists"));
    }
    res.status(200).json(new ApiResponse(200, post, "Post Fetch Successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const deletePost = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid Post id"));
    }
    const postAuthor = post.user_id.toString();
    const currentUser = req.user?._id.toString();
    // console.log(postAuthor,currentUser);

    if (postAuthor != currentUser && req?.user?.user_type!=="admin") {
      return res
        .status(200)
        .json(
          new ApiResponse(400, null, "Only author of the post can delete ")
        );
    }
    try {
      const { id } = req.params;

      const post = await Post.findById(id);

      if (!post) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Invalid Post id"));
      }
      const postAuthor = post.user_id.toString();
      const currentUser = req.user?._id.toString();
      // console.log(postAuthor,currentUser);

      if (postAuthor != currentUser && req?.user?.user_type!=="admin") {
        return res
          .status(200)
          .json(
            new ApiResponse(400, null, "Only author of the post can delete ")
          );
      }
      const image = post?.image;

      if (image) {
        const fullImageName = post.image.split("/").pop();
        const imageName = fullImageName.split(".")[0];

        // Delete post, comments, likes, and image asynchronously
        await Promise.all([
          deleteOnCloudinary(imageName),
          Comment.deleteMany({ post_id: id }),
          Notification.deleteMany({ post_id: id }),
          Like.deleteMany({ post_id: id }),
          Post.findByIdAndDelete(id),
        ]);
      } else {
        // Delete only post, comments, and likes if no image exists
        await Promise.all([
          Comment.deleteMany({ post_id: id }),
          Notification.deleteMany({ post_id: id }),
          Like.deleteMany({ post_id: id }),
          Post.findByIdAndDelete(id),
        ]);
      }

      return res
        .status(200)
        .json(new ApiResponse(200, null, "Post Deleted Successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error"));
    }

  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const updatePost = asyncHandler(async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;

    if (!caption) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Caption Is required"));
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Invalid Post Id"));
    }

    const postAuthor = post.user_id.toString();
    const currentUser = req.user?._id.toString();
    // console.log(postAuthor,currentUser);

    if (postAuthor != currentUser || req?.user?.user_type==="admin") {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Only author of the post can update"));
    }

    // Update the post caption

    const captionUpdate = await Post.findOneAndUpdate(
      { _id: postId },
      {
        $set: {
          caption,
        },
      },
      {
        new: true,
      }
    );
    // console.log(captionUpdate);

    const updatedPost = await Post.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(post._id),
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
        $addFields: {
          author: {
            $first: "$author",
          },
        },
      },
      {
        $project: {
          author: {
            password: 0,
            refreshToken: 0,
          },
          user_id: 0,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Post Updated Successfully"));
  } catch (error) {
    console.log(error);
  }
});

const explorePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.aggregate([
      {
        $match: {
          user_id: {
            $nin: [req.user?._id],
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $match: {
                is_blocked:false,
                is_private:false,
                blockList: {
                  $nin: [req.user?._id],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "post_id",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post_id",
          as: "comments",
        },
      },
      {
        $addFields: {
          comments: { $size: "$comments" },
          likes: { $size: "$likes" },
          author: {
            $first: "$author",
          },
        },
      },
      {
        $match: {
          author: { $ne: null }, // Exclude posts where the author is missing
        },
      },
      {
        $sample: {
          size: 12,
        },
      },
      {
        $project: {
          user_id: 0,
          view: 0,
          caption: 0,
        },
      },
    ]);

    let newPostsId = post.map((post) => post._id);

    newPostsId.map(async function (postId) {
      const post = await Post.findById(postId);
      post.view = post.view + 1;
      await post.save();
    });

    res.status(200).json(new ApiResponse(200, post, "Post Fetch Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Errors"));
  }
});

export {
  createPost,
  getPostById,
  getPostByUsername,
  getMyPost,
  deletePost,
  updatePost,
  getRandomPost,
  explorePost,
};
