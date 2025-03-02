import express from 'express';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { deleteMessage, getConversation, getMessages, sendMessage, sharePost } from '../controller/message.controller.js';

const messageRouter = express.Router();

messageRouter.get('/get/conversation',verifyJWT,getConversation);
messageRouter.post("/send",verifyJWT,sendMessage);
messageRouter.get("/get/:otherUserId",verifyJWT,getMessages);
messageRouter.delete("/:messageId",verifyJWT,deleteMessage);
messageRouter.post("/share/post",verifyJWT,sharePost);


export default messageRouter;

