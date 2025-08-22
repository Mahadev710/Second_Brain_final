import {v2 as cloud} from  "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECERT
});

const uploadOnCloudinary= async(localFilePath)=>{
    try{
        if(!localFilePath) return null;
        await cloudinary.upload.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("file is uploaded in cloudinary",response.url);
        return response;
     }  
     catch(error){
       fs.unlinkSync(localFilePath)//remove the locally saved file as the uppload operation got failed
       return null;
     }
}