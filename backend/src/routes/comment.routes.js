import express from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { addComment, deleteComment, getPostComment } from '../controller/comment.controller.js';

const commentRouter = express.Router();

commentRouter.post("/post/:postId",verifyJWT,addComment);
commentRouter.delete("/delete/:commentId",verifyJWT,deleteComment)
commentRouter.get('/post/:postId',verifyJWT,getPostComment)


export default commentRouter;