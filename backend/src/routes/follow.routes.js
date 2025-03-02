import express from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { acceptFollowRequest, cancelRequest, getFollowerList, getFollowingList, toggleFollow } from '../controller/follow.controller.js';

const followRouter = express.Router();

  followRouter.post('/:userId',verifyJWT,toggleFollow)
  followRouter.post("/request/:userId/accept",verifyJWT,acceptFollowRequest)
  followRouter.post("/request/:userId/cancel",verifyJWT,cancelRequest)
  followRouter.get("/list/follower/:username",verifyJWT,getFollowerList)
  followRouter.get("/list/following/:username",verifyJWT,getFollowingList)

export default followRouter;