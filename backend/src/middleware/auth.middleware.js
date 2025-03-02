import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verifyJWT = asyncHandler(async function (req,res,next) {
  try {
    
    const token = req.cookies?.refreshToken || req.header('Authorization')?.replace("Bearer ","");
    
    // console.log(token);
    // console.log(token);
    
    
    if(!token){
       throw new ApiError(400,"Unauthorized request")
    }
    const decodedToken =  jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
  
    const user = await User.findById(decodedToken?._id)?.select('-password -refreshToken');
    // console.log(user);
    
    if (!user){
      throw new ApiError(401,"Invalid Access Token")
    }
    req.user = user;
    // console.log(user);
    
    next()
  } catch (error) {
    throw new ApiError(401,error?.message || "Invalid access token")
    
  }


});