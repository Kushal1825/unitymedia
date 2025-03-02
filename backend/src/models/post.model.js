import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    image: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
    },
    view: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Post =  mongoose.model('post',postSchema);
