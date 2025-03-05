import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {app,server} from "./socket/socket.js";
// const app = express()
import dotenv from 'dotenv'
dotenv.config();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));

console.log(`${process.env.CORS_ORIGIN}`)


app.use(express.json()) 

app.use(express.urlencoded({extended:true})) 
app.use(express.static("public"))
app.use(cookieParser());

export { app,server }

