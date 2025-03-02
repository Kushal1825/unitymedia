import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    content: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"posts"
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("message", messageSchema);

