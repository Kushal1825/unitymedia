import mongoose from "mongoose"
import DB_NAME from '../constant.js'

const connectDB=async ()=>{
  try {
    const connection = await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log(connection.connections[0].host);
    
    console.log("connected");

    
  } catch (error) {
    console.log("Error occur while connection",error);
    
  }
}

export default connectDB;