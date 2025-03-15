import { Like } from "../models/like.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Story } from "../models/story.model.js";
import { Follow } from "../models/follow.model.js";

const createStory = asyncHandler(async (req, res) => {
  try {
    const localPath = req.file?.path;
    const {isCloseFriend} = req.body;
    // console.log(isCloseFriend);
    const storyType = isCloseFriend === "true"
    
    

    if (!localPath) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "File is required"));
    }

    const storyImage = await uploadOnCloudinary(localPath);

    if (!storyImage) {
      return res
        .status(200)
        .json(new ApiResponse(500, null, "Error while upload the Image"));
    }

    const user = await User.findById(req.user._id);

    const newStory = await Story.create({
      media_url: storyImage.secure_url,
      user_id: user._id,
      isCloseFriend:storyType
    });

    if (!newStory) {
      return res
        .status(200)
        .json(new ApiResponse(500, null, "Error while create the Story"));
    }

    const story = await Story.aggregate([
      {
        $match: {
          user_id: user._id,
          expires_at: {
            $gt : new Date(Date.now())
           }
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "Author",
        },
      },
      {
        $addFields: {
          Author: {
            $first: "$Author",
          },
        },
      },
      {
        $project: {
          user_id: 0,
          Author: {
            password: 0,
            refreshToken: 0,
          },
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, story, "storyCreated Successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getMyStories = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user?._id);
    const stories = await Story.aggregate([
      {
        $match: {
           user_id: user._id ,
           expires_at: {
            $gt : new Date(Date.now())
           }
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "Author",
        },
      },
      {
        $addFields: {
          Author: {
            $first: "$Author",
          },
        },
      },
      {
        $project: {
          user_id: 0,
          Author: {
            password: 0,
            refreshToken: 0,
          },
        },
      },
    ]);
    // console.log(stories);

    return res
      .status(200)
      .json(new ApiResponse(200, stories, "User Story fetch Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getfollowingStory = asyncHandler(async (req,res)=>{
  try {
    const followings = await Follow.find({
      follower_id:req.user?._id
    }).populate("following_id");

    
    
    const followingsId = followings.map((elem)=> elem.following_id._id)
    

    const stories = await Story.aggregate([
      {
        $match: {
          user_id: { $in: [...followingsId,req.user._id] },
          expires_at: { $gt: new Date() }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "Author",
          pipeline:[
            {
             $match:{
              blockList:{
                $nin:[req.user?._id]
              }
             }
            }
          ]
        }
      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"story_id",
          as:"likes"
        }
      },
      {
        $addFields: {
          Author: { $first: "$Author" },
          isLike: {
            $cond: {
              if: {
                $in: [req.user?._id, "$likes.user_id"],
              },
              then: true,
              else: false,
            },
          },
        }
      },
      {
        $match: {
          Author: { $ne: null } // Exclude posts where the author is missing
        },
      },
      {
        $match: {
          $or: [
            { isCloseFriend: false },
            {
              $and: [
                { isCloseFriend: true },
                {

                  $or:[
                    { "Author.closeFriends":{$in: [req.user._id] }},
                    {"Author._id":{$eq: req.user._id}}
                  ]
                },
              ]
            }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          media_url: 1,
          createdAt: 1,
          isCloseFriend: 1,
          isLike:1,
          Author: {
            _id: 1,
            username: 1,
            avatar: 1,
            closeFriends: 1
          }
        }
      },
      {
        $group: {
          _id: "$Author._id",
          stories: { $push: "$$ROOT" }
        }
      },
      {
        $sort:{
          "stories[0].createdAt":1
        }
      },
      {
        $project: {
          _id: 0,
          user: "$_id",
          stories: 1
        }
      }
    ]);

    // console.log(stories);
    
    return res.status(200)
    .json(new ApiResponse(200,stories,"Followings Story Fetch Successfully"))
    
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getStoryById = asyncHandler(async (req,res)=>{
  try {
    const {storyId} = req.params; 
    const verifyStory = await Story.findById(storyId);

    if(!verifyStory){
      return res.status(200)
      .json(new ApiResponse(400,null,"Story is Not exists"));
    }

    if(verifyStory.expires_at < Date.now()){
      return res.status(200)
      .json(new ApiResponse(400,null,"Story is expires"));
    }
    const findCurrentUserSeen = verifyStory.views.indexOf(req.user?._id);
    if(findCurrentUserSeen == -1){
      verifyStory.views.push(req.user?._id)
      // console.log(verifyStory.views);
      await verifyStory.save();
    }


    const story = await Story.aggregate([
      {
       $match:{
        _id:verifyStory._id
       } ,
      },
      {
        $lookup:{
          from:"users",
          localField:'user_id',
          foreignField:"_id",
          as:"author"
        }
      },
      {
        $lookup:{
          from:'likes',
          localField:"_id",
          foreignField:"story_id",
          as:"likes"
        }
      },
      {
        $addFields:{
          author:{
            $first:"$author"
          },
          isLike:{
            $cond:{
              if:{
                $in:[req.user?._id,"$likes.user_id"]
              },
              then:true,
              else:false
            }
          },
        }
      },
      {
        $project:{
          author:{
            username:1,
            avatar:1,
            _id:1,
          },
          isLike:1,
          duration:1,
          media_url:1,
          views:1,
          expires_at:1
        }
      }
    ]);

    return res.status(200)
    .json(new ApiResponse(200,null,"Story fetched successfully"));

  } catch (error) {
    console.log(error);
    return res.status(500)
    .json(new ApiResponse(500,null,"Internal Server Error"));
  }
})

const deleteMyStory = asyncHandler(async (req,res)=>{
  try {

    const {storyId} = req.params;
    const verifyStory = await Story.findById(storyId);

    if(!verifyStory){
      return res.status(200)
      .json(new ApiResponse(400,null,"Invalid Story Id"));
    }

    const currentUser = req.user?._id.toString();
    const storyCreator = verifyStory.user_id.toString();

    if(currentUser != storyCreator){
      return res.status(200)
      .json(new ApiResponse(400,null,"You cannot delete the story"));
    }


    const {media_url} = verifyStory;

    const urlArray = media_url.split("/")
    const FileNamewithExtension = urlArray[urlArray.length -1]

    const publicName = FileNamewithExtension.split(".")[0];

    // console.log(publicName);
    

    await deleteOnCloudinary(publicName);

    await Story.findByIdAndDelete(verifyStory._id);

    return res.status(200)
    .json(new ApiResponse(200,null,"story Remove Successfully"));
    
  } catch (error) {
    console.log(error);
    return res.status(500)
    .json(new ApiResponse(500,null,"Internal Server Error"))
    
  }
});



export { createStory,getStoryById, getMyStories,getfollowingStory,deleteMyStory };
