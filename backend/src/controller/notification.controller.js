import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";


const getNotification = asyncHandler(async (req,res)=>{
  try {

    // console.log(req.user?._id);
    
    
    const myNotification = await Notification.aggregate([
      {
        $match:{
          user_id:req.user?._id,
        }
      },
      {
        $lookup:{
          from:'users',
          localField:"sender_id",
          foreignField:'_id',
          as:"sender",
          pipeline:[{
            $match:{
              is_blocked:false
            }
          }]
        }
      },
      {
        $lookup:{
          from:"posts",
          localField:"post_id",
          foreignField:"_id",
          as:"post",
          pipeline:[
            {
              $project:{
                image:1,
                _id:1
              }
            }
          ]
        }
      },
      {
        $addFields:{
          sender:{
            $first:'$sender'
          },
          post:{
            $first:'$post'
          }

        }
      },
      {
        $match:{
          $and:[
            {sender:{$ne:null}}
          ]
        }
      },
      {
        $sort:{
          createdAt:-1
        }
      },
      {
        $limit:5
      },
      {
        $project:{
          
          sender:{
            password:0,
            refreshToken:0
          },
          
        }
      }
    ]);
    // console.log(myNotification);
    
    return res.status(200)
    .json(new ApiResponse(200,myNotification,"Notification Fetched Successfully"));

  } catch (error) {
    console.log(error);
    return res.status(500)
    .json(new ApiResponse(500,null,"Internal Server Error"));
    
  }
});



export {
  getNotification
}