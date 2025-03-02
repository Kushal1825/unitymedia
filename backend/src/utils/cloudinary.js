import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadOnCloudinary = async function (localFilePath) {
  try {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });

    if (!localFilePath) return null;

    const uploadResult = await cloudinary.uploader
      .upload(localFilePath)
    // console.log(uploadResult);
    
    fs.unlinkSync(localFilePath);
    return uploadResult;

  } catch (err) {
    console.log(err);

    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteOnCloudinary = async function (publicId){
  try {
    
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });

    if (!publicId) return null;
    // console.log(publicId);
    

    await cloudinary.uploader.destroy(publicId)
    
    

  } catch (err) {
    
    return null;
  }
}