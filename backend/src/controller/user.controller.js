import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import {
  resetPasswordVerificationEmail,
  sendVerificationEmail,
} from "../utils/sendVerificationEmail.js";
import { Notification } from "../models/notification.model.js";

const cookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path:"/",
  
};
const cookieClear = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
};
const getRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);

    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return refreshToken;
  } catch (error) {
    console.log(error);
  }
};

const signupUser = asyncHandler(async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;

    if (
      [email, username, fullName, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      return res.status(200).json(new ApiResponse(400,null,"All fields are Required"));
    }

    const existingUserByUsername = await User.findOne({
      username,
      isVerified: true,
    });
    await User.findOneAndDelete({username,isVerified:false})
    

    if (existingUserByUsername) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Username is already exist use other username"));
    }

    const existingUserWithEmail = await User.findOne({
      email,
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserWithEmail) {
      if (existingUserWithEmail.isVerified) {
        return res
          .status(200)
          .json(new ApiResponse(404, null, "User already exist with email"));
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUserWithEmail.password = hashedPassword;
        existingUserWithEmail.emailVerifyCode = verifyCode;
        existingUserWithEmail.emailVerifyCodeExpires = new Date(
          Date.now() + 1000 * 60 * 60 * 24
        );
        await existingUserWithEmail.save();
      }

      // true part
    } else {
      const newUser = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        emailVerifyCode: verifyCode,
        emailVerifyCodeExpires: Date.now() + 1000 * 60 * 60 * 24,
      });
    }

    // send Verification Email

    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return res
        .status(200)
        .json(new ApiResponse(500, null, emailResponse.message));
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          null,
          "User registered successfully . Please verify Your Email"
        )
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, error.message));
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  try {
    const { username, otp } = req.body;
    const verifyUser = await User.findOne({
      username: username.toLowerCase(),
    }).select("+emailVerifyCode +emailVerifyCodeExpires");

    // Check if user exists
    if (!verifyUser) {
      return res.status(400).json(new ApiResponse(400, null, "User not found"));
    }

    // Check if user is already verified
    if (verifyUser.isVerified) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "User is already verified"));
    }

    // Check if code is expired
    if (verifyUser.emailVerifyCodeExpires < new Date(Date.now())) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Verification Code Expired"));
    }

    if (verifyUser.emailVerifyCode == otp) {
      verifyUser.isVerified = true;
      verifyUser.emailVerifyCode = null; // Clear verification code
      verifyUser.emailVerifyCodeExpires = null; // Clear expiry time
      await verifyUser.save();

      return res
        .status(200)
        .json(new ApiResponse(200, null, "User verified Successfully"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Invalid verification code"));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password);
    
    if ([email, password].some((field) => field.trim() === "")) {
      throw new ApiError(400, "All field required");
    }
    const userEmail = email.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: userEmail }, { username: userEmail }],
    });

    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Invalid Username or Email"));
    }

    if (!user.isVerified) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            400,
            null,
            "User Email Is not Verified . Please Verified Your Email"
          )
        );
    }
    if(user.is_blocked){
      return res.status(200)
      .json(
        new ApiResponse(
          400,
          null,
          "Your account is blocked contact admin for further detail."
        )
      )
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    //  console.log(isPasswordValid,"1");

    if (!isPasswordValid) {
      return res.status(200).json(new ApiResponse(408, null, "invalid Credential"));
    }
    const refreshToken = await getRefreshToken(user._id);
    //  console.log(refreshToken);

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    return res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieOption)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            refreshToken,
          },
          "User logged in Successfully"
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    );

    res
      .status(200)
      .clearCookie("refreshToken", cookieClear)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {

  if (req?.user?.is_blocked) {
    // Clear authentication cookie (assuming the cookie name is 'token')
    res.clearCookie("refreshToken", cookieClear);

    return res.status(403).json(new ApiResponse(403, null, "User is blocked. Logging out."));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserAvtar = asyncHandler(async (req, res) => {
  try {
    const avtarLocalPath = req.file?.path;
    // check url is available or not
    if (!avtarLocalPath) {
      throw new ApiError(400, "Avatar file is missing");
    }
    //upload the image on url
    const avatar = await uploadOnCloudinary(avtarLocalPath);

    //check image upload successfully or not

    if (!avatar) {
      throw new ApiError(400, "Error while uploading an avatar");
    }

    // check the user already have the image before if yes than remove it

    if (req.user.avatar?.id) {
      let public_id = req.user.avatar.id;
      await deleteOnCloudinary(public_id);
    }

    const avatar_info = {
      url: avatar.secure_url,
      id: avatar.public_id,
    };
    // Update the Avtar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          avatar: avatar_info,
        },
      },
      {
        new: true,
        multi: true,
      }
    ).select("-password -refreshToken");
    // console.log(user);
    
    return res
      .status(200)
      .json(new ApiResponse(200, user, "avatar update successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const updateUserInfo = asyncHandler(async (req, res) => {
  try {
    const { fullName, username, bio } = req.body;

    //check that the usernaem and name not been empty
    // console.log(fullName,username);

    if ([fullName, username].some((field) => field.trim() === "")) {
      return res.status(205).json( new ApiResponse(205, "Please provide the username and fullName"));
    }

    //check the username is exist or not

    const existingUser = await User.findOne({ username });
    if (existingUser && !existingUser._id.equals(req.user._id)) {
      return res.status(200).json(new ApiResponse(200, null, "Username is not available"));
    }

    //update the data and return to the frontend

    if(username === req.user.username){

      const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName,
            bio,
          },
        },
        {
          new: true,
          multy: true,
        }
      ).select("-password -refreshToken");
      return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
    }else{
      const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName,
            username,
            bio,
          },
        },
        {
          new: true,
          multy: true,
        }
      ).select("-password -refreshToken");
      return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
    }

  } catch (error) {
    console.log(error);
  }
});

const updatePrivacySetting = asyncHandler(async(req,res)=>{
try {

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        is_private:!req.user?.is_private
      },
    },
    {
      new: true,
      multy: true,
    }
  ).select("-password -refreshToken");
  return res
  .status(200)
  .json(new ApiResponse(200, updatedUser, "Profile updated successfully."));
} catch (error) {
  
}
})

const changeUserPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    const verifyPassword = await user?.isPasswordCorrect(oldPassword);

    // check the Old password
    if (!verifyPassword) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Invalid Old password"));
    }
    const password = await bcrypt.hash(newPassword, 10);
    const updateUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          password,
        },
      },
      {
        new: true,
        multy: true,
      }
    ).select("-password -refreshToken");

    if (!updateUser) {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Error while update the password"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updateUser, "Password changed successfully"));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const findVerifyUser = await User.findOne({
    $or: [{ email: email }, { username: email }],
  });

  if (!findVerifyUser) {
    return res
      .status(200)
      .json(new ApiResponse(400, null, "Email or username is not exists"));
  }

  if (!findVerifyUser.isVerified) {
    return res
      .status(200)
      .json(
        new ApiResponse(400, null, "User is Not Verified. Please verify email")
      );
  }

  findVerifyUser.resetPasswordToken = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  findVerifyUser.resetPasswordTokenExpires = new Date(
    Date.now() + 1000 * 60 * 60 * 24
  );

  await findVerifyUser.save();

  const emailResponse = await resetPasswordVerificationEmail(
    findVerifyUser.username,
    findVerifyUser.email,
    findVerifyUser.resetPasswordToken
  );

  if (!emailResponse.success) {
    return res
      .status(200)
      .json(new ApiResponse(500, null, emailResponse.message));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        null,
        "Password verification code send successfully."
      )
    );
});

const verifyResetToken = asyncHandler(async (req, res) => {
  try {
    const { token } = req.body;
    const { email } = req.body;
    // console.log(token,email);
    

    const user = await User.findOne({
      $or:[{email},{username:email}],
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: Date.now() },
    });
    // console.log(user);
    

    if (!user) {
      return res
        .status(200)
        .json(new ApiResponse(400, null, "Invalid Token or Token is Expires"));
    }

    if (user) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { email: user.email, token },
            "Token Verified successfully"
          )
        );
    }
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const ResetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    const user = await User.findOne({
      $or:[{email},{username:email}],
      resetPasswordToken: token,
      resetPasswordTokenExpires: { $gt: new Date(Date.now()) },
    });

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is Not Exists"));
    }
    
    user.password = newPassword;
    user.resetPasswordToken = "";
    user.resetPasswordTokenExpires = "";

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password Updated Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;
    const user_type= req.user?.user_type;

    if (!username?.trim()) {
      throw new ApiError(400, "username is missing");
    }
    const match_condition={
      $and: [
        { username: username },
        {
          blockList: {
            $nin: [req.user?._id],
          },
        },
        { isVerified: true },
        
      ],
      
    }
    if(user_type === "user"){
      match_condition.$or=[
        {
          is_blocked:false
        }, 
      ]
    }
    const userProfile = await User.aggregate([
      {
        $match: match_condition,
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "user_id",
          as: "posts",
        },
      },
      {
        $lookup: {
          from: "notifications",
          localField: "_id",
          foreignField: "user_id",
          as: "follow_request",
          pipeline: [
            {
              $match: {
                notification_type: "follow_request",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "following_id",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "follows",
          localField: "_id",
          foreignField: "follower_id",
          as: "following",
        },
      },
      {
        $addFields: {
          postCount: {
            $size: ["$posts"],
          },
          followerCount: {
            $size: ["$followers"],
          },
          followingCount: {
            $size: ["$following"],
          },
          isFollow: {
            $cond: {
              if: { $in: [req.user?._id, "$followers.follower_id"] },
              then: true,
              else: false,
            },
          },
          hasFollowReqest: {
            $cond: {
              if: {
                $and: [
                  { $gt: [{ $size: "$follow_request" }, 0] },
                  { $in: [req.user?._id, "$follow_request.sender_id"] },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          bio: 1,
          postCount: 1,
          followerCount: 1,
          followingCount: 1,
          isFollow: 1,
          avatar: 1,
          email: 1,
          is_private:1,
          notificationSettings:1,
          hasFollowReqest: 1,
          is_blocked:1,
          user_type:1,
        },
      },
    ]);
    // console.log(userProfile)
    return res
      .status(200)
      .json(
        new ApiResponse(200, userProfile, "User profile feteched successfully")
      );
  } catch (error) {
    console.error(error.message);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Error"));
  }
});

const suggestUsers = asyncHandler(async (req, res) => {
  try {
    const followings = await Follow.find({
      follower_id: req.user?._id,
    }).populate("following_id");

    const requestUser = await Notification.find({
      sender_id: req.user?._id,
      notification_type: "follow_request",
    });

    // Extract IDs from followings and requests
    const followingIds = followings.map((user) => user.following_id._id);
    const requestIds = requestUser.map((notif) => notif.user_id); // Fix requestIds extraction;
    const blockList = req?.user?.blockList.map((user)=>user);
    // console.log(blockList);
    

    // Exclude users who are followed, requested, or the current user
    const excludeUsers = [...followingIds, req.user?._id, ...requestIds,...blockList];

    const suggestUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeUsers }, 
          blockList: { $ne: req.user._id }, 
          isVerified: true, 
          is_blocked:false
        },
      },
      {
        $sample: { size: 5 }, 
      },
      {
        $project: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, suggestUsers, "Suggestions fetched successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});

const searchUser = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const regex = new RegExp(username);
    const exceptUser = [req.user?.username];
    const match_condition={
      $and: [
        { username: { $regex: regex } },
        { username: { $nin: exceptUser } },
        { isVerified: true },
        { blockList: { $nin: [req.user?._id] } },
        
      ],
    }
    if(req.user.user_type==="user"){
      match_condition.$or=[
        {
          is_blocked:false
        }
      ]
    }

    const user = await User.aggregate([
      {
        $match: match_condition
      },
      {
        $project: {
          avatar: 1,
          _id: 1,
          username: 1,
        },
      },
    ]);

    // console.log(user);

    res.status(200).json(new ApiResponse(200, user, "User Match List"));
  } catch (error) {
    console.log(error);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Internal Server Error"));
  }
});

const BlockedUser = asyncHandler(async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not exists"));
    }

    // console.log(req.user?._id);

    const currentUser = await User.findById(req.user?._id);
    // console.log(currentUser);

    if (currentUser?.blockList.indexOf(user?._id) == -1) {
      currentUser?.blockList.push(user._id);
      await currentUser.save();

      // console.log("Hello world");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User Blocked Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal Server Errors"));
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const currentUser = await User.findById(req.user?._id);
    let userIndex = currentUser.blockList.indexOf(userId);

    if (userIndex != -1) {
      currentUser.blockList.splice(userIndex, 1);
      await currentUser.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User unblock successfully"));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Error"));
  }
});

const userBlockList = asyncHandler(async (req, res) => {
  try {
    // const id = req.user?._id;
    const blockList = await User.aggregate([
      {
        $match: {
          _id: {
            $in: req.user?.blockList,
          },
            is_blocked:false
        },
      },
      {
        $project: {
          username: 1,
          _id: 1,
          avatar: 1,
        },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, blockList, "Block list fetch successfully"));
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Errors"));
  }
});

const addCloseFriend = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const verifyUser = await User.findById(userId);

    if (!verifyUser) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid UserId"));
    }

    if (req.user?.closeFriends.indexOf(verifyUser._id) == -1) {
      req.user?.closeFriends.push(verifyUser._id);
      await req.user.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Add to CloseFriend successfully"));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Errors"));
  }
});

const removeCloseFriend = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const verifyUser = await User.findById(userId);

    if (!verifyUser) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid UserId"));
    }
    const userIndex = req.user?.closeFriends.indexOf(verifyUser._id);
    if (userIndex != -1) {
      req.user?.closeFriends.splice(userIndex, 1);
      await req.user.save();
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Remove to CloseFriend successfully"));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Errors"));
  }
});

const closeFriendList = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const followings = await Follow.find({
      follower_id: userId,
    });

    const followingsList = followings.map((user) => user.following_id);
    // console.log(followingsList);

    let friends = await User.aggregate([
      {
        $match: {
          $and: [
            {
              _id: {
                $in: followingsList,
              },
            },
            { blockList: { $nin: [req.user?._id] } },
            {
              is_blocked:false
            }
          ],
        },
      },
      {
        $addFields:{
          isCloseFriend:{
            $in:["$_id",req.user?.closeFriends]
          }
        }
      },
      {
        $project :{
          username: 1,
          avatar: 1,
          _id: 1,
          fullName: 1,
          isCloseFriend:1
        }
      }
    ]);

    // const closeFriend=friends.filter((friend)=> {
    //   return req.user?.closeFriends.indexOf(friend._id) != -1
    // });
    // const following = friends.filter((friend)=>{
    //   return req.user?.closeFriends.indexOf(friend._id) == -1
    // });
    // console.log(closeFriend);

    return res
      .status(200)
      .json(new ApiResponse(200, friends, "Close Friend successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(new ApiResponse(500, error.message, "Internal Server Errors"));
  }
});

const updateNotificationSetting = asyncHandler(async (req,res)=>{
  try {
    const userId = req.user?._id; // Assuming authenticated user
    const updates = {};
    
    // List of allowed fields and values
    const allowedFields = ['like', 'comment', 'follow'];
    const allowedValues = ['all', 'off'];

    // Validate and build updates
    allowedFields.forEach(field => {
      if (req.body[field] && allowedValues.includes(req.body[field])) {
        updates[`notificationSettings.${field}`] = req.body[field];
      }
    });

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }

    ).select('notificationSettings');
    res.status(200).json(new ApiResponse(200,updatedUser,"Update Successfully"));
  } catch (error) {
    console.log(error);
    
  }
})

export {
  signupUser,
  verifyUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserAvtar,
  updateUserInfo,
  updatePrivacySetting,
  changeUserPassword,
  forgetPassword,
  getUserProfile,
  suggestUsers,
  searchUser,
  verifyResetToken,
  ResetPassword,
  BlockedUser,
  unblockUser,
  userBlockList,
  addCloseFriend,
  removeCloseFriend,
  closeFriendList,
  updateNotificationSetting
};
