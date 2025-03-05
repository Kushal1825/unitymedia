// require('dotenv').config({path:"./env"})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app,server } from "./app.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js";
import followRouter from "./routes/follow.routes.js";
import storyRouter from "./routes/story.routes.js";
import NotificationRouter from "./routes/notification.routes.js";
import messageRouter from "./routes/message.routes.js";
dotenv.config()
connectDB()
.then(()=>{
    server.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("MONGODB db connection Failed !! ", err);
})


app.use('/api/user',userRouter)
app.use("/api/post",postRouter)
app.use("/api/like",likeRouter)
app.use('/api/comment',commentRouter)
app.use('/api/follow',followRouter)
app.use("/api/story",storyRouter)
app.use("/api/notification",NotificationRouter)

app.use('/api/message',messageRouter)

app.use("*",async(req,res)=>{
    res.end("Hello")
})