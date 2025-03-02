import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    lastMessage: {
      content: {
        type: String,
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("conversation", conversationSchema);
