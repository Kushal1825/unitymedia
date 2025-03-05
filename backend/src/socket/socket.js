import {Server} from 'socket.io';

import http from 'http';
import express from "express";
import { Message } from '../models/message.model.js';
import { Conversation } from '../models/conversation.model.js';
import mongoose from 'mongoose';



const app = express();
const server = http.createServer(app);

const io = new Server(server,{
  cors:{
    origin:"https://unitymedia-backend.onrender.com",
    methods:["GET","POST"]
  }
});


const userSocketMap = {} //userId : socketId

export const getRecipientSocketId = (recipientId)=>{
  // console.log(userSocketMap);
  
  return userSocketMap[recipientId];
}



io.on("connection",(socket)=>{
  // console.log("User connected",socket.id);

  const userId = socket.handshake.query.userId;

  if(userId != "undefined") userSocketMap[userId]=socket.id;

  io.emit("getOnlineUsers",Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen",async({conversationId,userId})=>{
    try {
      // console.log(conversationId);
      // let message ,conversation;
      await Promise.all([
        Message.updateMany(
          { conversationId,sender:userId, seen: false },
          { $set: { seen: true } }
        ),
        Conversation.updateOne(
          { _id: conversationId },
          { $set: { "lastMessage.seen": true } }
        )
      ]);
      // console.log("done");
      
      
      io.to(userSocketMap[userId]).emit("messagesSeen",{conversationId})
    } catch (error) {
      
      console.log(error);
      
    }
  })
  
  socket.on("disconnect",()=>{
    // console.log("Use disconnected");
    delete userSocketMap[userId]
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    
  })
})

export{io ,server,app};