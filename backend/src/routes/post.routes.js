import express from 'express'
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import { createPost, deletePost, explorePost, getMyPost, getPostById, getPostByUsername, getRandomPost, updatePost } from '../controller/post.controller.js';

const router = express.Router();


router.post('/create',verifyJWT,upload.single('image'),createPost)
router.get('/p/:id',verifyJWT,getPostById)
router.get("/u/:username",verifyJWT,getPostByUsername)
router.get('/get/my',verifyJWT,getMyPost)
router.delete('/delete/:id',verifyJWT,deletePost)
router.patch('/update/:postId',verifyJWT,updatePost)
router.post("/random-post",verifyJWT,getRandomPost)
router.get('/explore',verifyJWT,explorePost);


export default router;