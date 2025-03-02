import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
    story_id:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"story"
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("like",likeSchema);