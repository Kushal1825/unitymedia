import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";


const blockUser = asyncHandler(async(req,res)=>{
  try {
    // Check if the requester is an admin
    if (req.user.user_type !== "admin") {
      return res.status(200).json(new ApiResponse(403, null, "Access denied. Admins only."));
    }

    // Get user ID from request parameters
    const { userId } = req.params; // Or req.params.id based on your route

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json(new ApiResponse(404, null, "User not found"));
    }

    // Toggle the is_block field
    user.is_blocked = !user.is_blocked;
    // user.refreshToken="";
    await user.save();
    

    return res.status(200).json(new ApiResponse(200, user, `User has been ${user.is_blocked ? "blocked" : "unblocked"}`));
  } catch (error) {
    console.error("Error in blockUser:", error);
    return res.status(200).json(new ApiResponse(500, null, "Internal server error"));
  }
})

export {
  blockUser
};