import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {app,server} from "./socket/socket.js";
// const app = express()

app.use(cors({
    origin: "*",
  credentials: true
}))


app.use(express.json()) 

app.use(express.urlencoded({extended:true})) 
app.use(express.static("public"))
app.use(cookieParser());

export { app,server }

