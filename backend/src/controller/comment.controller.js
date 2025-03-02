import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import {Notification} from '../models/notification.model.js'
import { Follow } from "../models/follow.model.js";


const addComment = asyncHandler(async (req,res)=>{
 try {
   const {content} = req.body
   const {postId} = req.params
 
   const findPost = await Post.findById(postId)
   
   if(!findPost){
     return res.status(400)
     .json(new ApiResponse(400,null,"Invalid Post Id"));
   }
 
   const newComment = await Comment.create({
     content,
     post_id:findPost._id,
     author:req.user?._id
   });
 
   if(!newComment){
     return res.status(500)
     .json(new ApiResponse(500,null,"Server Error for creating the comment"))
   }
 
   const postOwner = await User.findById(findPost.user_id);

   if(postOwner.notificationSettings.comment === "all")
   {
     await Notification.create({
     user_id:findPost.user_id,
     post_id:newComment.post_id,
     notification_type:"comment",
     sender_id:newComment.author
    });
   }
   else if(postOwner.notificationSettings.comment === 'following'){
    const isFollowed = await Follow.findOne({
      following_id:req.user?._id,
      follower_id:postOwner._id
    });

    if(isFollowed){
      await Notification.create({
        user_id:findPost.user_id,
        post_id:newComment.post_id,
        notification_type:"comment",
        sender_id:newComment.author
       });
    }
   }
   else{}

  //  console.log(newNotification);
   
 
   return res.status(200)
   .json(new ApiResponse(201,newComment,"Comment added successfully"))
 } catch (error) {
  console.error(error);
  return res
    .status(500)
    .json(new ApiResponse(500, null, "Internal Server Error"));
  
 }
  
});

const deleteComment = asyncHandler(async (req,res)=>{

 try {
   const {commentId} = req.params;
 
   if(!commentId){
     return res.status(400)
     .json(new ApiResponse(400,null,"Comment Id needs"));
 
   }
 
   const user = await User.findById(req.user?._id);
   const comment = await Comment.findById(commentId);
 
   if(!comment){
     res.status(400)
     .json(new ApiResponse(400,null,"Comment is not exists"))
   }
   const author = comment.author.toString();
   const currentUserId = user._id.toString();
 
   if( author != currentUserId){
     return res.status(400)
     .json(new ApiResponse(400,null,"Unauthorize comment remover"));
   }
 
   await Comment.findByIdAndDelete(comment._id);
 
   return res
     .status(200)
     .json(new ApiResponse(200, null, "Comment Deleted Successfully"));
 } catch (error) {
  console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
 }
});

const getPostComment = asyncHandler(async (req,res)=>{

  try {
    const {postId} = req.params;
  
  
    const verifyPost = await Post.findById(postId);
  
    if(!verifyPost){
      return res.status(400)
      .json(new ApiResponse(400,null,"Invalid Post Id"))
    }
    const getComment = await Comment.aggregate([
      {
        $match:{
            post_id:verifyPost._id
        },
      },
      {
        $lookup:{
          from:"likes",
          localField:"_id",
          foreignField:"comment_id",
          as:"likes"
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"author",
          foreignField:"_id",
          as:"author"
        }
      },
      {
        $addFields:{
          isLiked:{
            $cond:{
              if : {$in:[req.user?._id, "$likes.user_id"]},
              then:true,
              else:false
            }
          },
          likes:{
            $size:"$likes"
          },
          author:{
            $first:"$author"
          }
        }
      },
      {
        $project:{
          author:{
            password:0,
            refreshToken:0
          }
        }
      }
    ])
  
    // console.log(getComment);
  
    return res.status(200)
    .json(new ApiResponse(200,getComment,"All Comment Fetch Successfully"))
    
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

export {
  addComment,
  deleteComment,
  getPostComment
}