import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  sender_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  post_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'post'
  },
  story_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"story"
  },
  notification_type:{
    type:String,
    enum:["like","comment","follow","follow_request"]
  },
  is_read:{
    type:Boolean,
    default:false
  }
},{timestamps:true});


export const Notification = new mongoose.model("notification",notificationSchema);