import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    media_url: {
      type: String,
      required: true,
    },
    duration:{
      type:Number,
      default:15
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"users",
      required: true,
    },
    views:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"users"
    }],
    isCloseFriend:{
      type:Boolean,
      default:false,
    },
    expires_at: {
      type: Date,
      default: Date.now() + 24 * 60 * 60 * 1000,
    },
  },
  { timestamps: true }
);

export const Story = mongoose.model("story", storySchema);
