import express from "express";
import { addCloseFriend, BlockedUser, changeUserPassword, closeFriendList, forgetPassword, getCurrentUser, getUserProfile, loginUser, logoutUser, removeCloseFriend, ResetPassword, searchUser, signupUser, suggestUsers, unblockUser, updateNotificationSetting, updatePrivacySetting, updateUserAvtar,updateUserInfo, userBlockList, verifyResetToken, verifyUser } from "../controller/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.post('/signup',signupUser);
router.post("/verify-user",verifyUser)
router.post('/login',loginUser);
router.post('/logout',verifyJWT,logoutUser);
router.get('/c/user',verifyJWT,getCurrentUser);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvtar)
router.route('/update-profile').patch(verifyJWT,updateUserInfo)
router.route("/update-privacy").patch(verifyJWT,updatePrivacySetting)
router.route('/change-password').patch(verifyJWT,changeUserPassword)
router.route("/profile/:username").get(verifyJWT,getUserProfile)
router.get("/suggest/me",verifyJWT,suggestUsers);
router.get("/search/:username",verifyJWT,searchUser);
router.post('/forget-password',forgetPassword);
router.post('/verify-reset-token/:token',verifyResetToken);
router.post('/reset-password',ResetPassword);
router.post("/block/:username",verifyJWT,BlockedUser)
router.patch('/unblock/:userId',verifyJWT,unblockUser);
router.get('/block/list',verifyJWT,userBlockList);
router.patch('/closeFriend/add/:userId',verifyJWT,addCloseFriend);
router.patch("/closeFriend/remove/:userId",verifyJWT,removeCloseFriend);
router.get("/list/closeFriend",verifyJWT,closeFriendList);
router.put("/notification-settings",verifyJWT,updateNotificationSetting);

export default router;