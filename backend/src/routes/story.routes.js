import express from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js'
import { upload } from '../middleware/multer.middleware.js';
import { createStory, deleteMyStory, getfollowingStory, getMyStories, getStoryById } from '../controller/story.controller.js';


const storyRouter = express.Router();

storyRouter.post('/create',verifyJWT,upload.single("image"),createStory);
storyRouter.get("/get/my",verifyJWT,getMyStories);
storyRouter.get("/get/my/followings",verifyJWT,getfollowingStory)
storyRouter.delete("/delete/:storyId",verifyJWT,deleteMyStory)
storyRouter.get("/get/:storyId",verifyJWT,getStoryById)


export default storyRouter;