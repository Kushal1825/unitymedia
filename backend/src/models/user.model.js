import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      id: {
        type: String,
        default: "",
      },
    },
    bio: {
      type: String,
      default: "",
    },
    is_private: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    user_type:{
      type:String,
      enum:["user","admin"],
      default:"user"
    },
    is_blocked:{
      type:Boolean,
      default:false,
    },
    blockList: [
      { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user" 
      }
    ],
    closeFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    notificationSettings:{
      like:{
        type:String,
        enum:['all',"off"],
        default:"all"
      },
      comment: {
        type: String,
        enum: ['all', 'off'], // Define allowed values
        default: 'all'
      },
      follow: {
        type: String,
        enum: ['all', 'off'], 
        default: 'all'
      }
    },
    emailVerifyCode: {
      type: String,
      select: false,
    },
    emailVerifyCodeExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordTokenExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return null;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  // console.log(password,this.password);

  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("user", userSchema);
