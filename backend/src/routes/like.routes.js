import express from "express"
import { verifyJWT } from "../middleware/auth.middleware.js"
import { toggleCommentLike, togglePostLike, toggleStoryLike } from "../controller/like.controller.js";

const router = express.Router();

router.get("/post/:postId",verifyJWT,togglePostLike);
router.get('/comment/:commentId',verifyJWT,toggleCommentLike);
router.get('/story/:storyId',verifyJWT,toggleStoryLike);

export default router;


