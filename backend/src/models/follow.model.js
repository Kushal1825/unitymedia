import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower_id: {
      // who follow the  user
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    following_id: {
      // whom to follow
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

export const Follow = mongoose.model("follow", followSchema);
