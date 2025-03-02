import express from 'express'
import {verifyJWT} from '../middleware/auth.middleware.js';
import { getNotification } from '../controller/notification.controller.js';


const NotificationRouter = express.Router();

NotificationRouter.get("/my",verifyJWT,getNotification)

export default NotificationRouter;