import { User } from "../models/User.js";
import HttpError from "../utils/httperror.js";

export const updateuser = async (req, res, next) => {
  try {
    const {firstName, lastName,email,} =req.body;
    const {user_id,user_role} =req.user_data;
    const imagePath = req.file ? req.file.path : null

    // Check whether another user is already using this email
    const existinguser = await User.findOne({ _id: { $ne: user_id }, email:email})
    console.log("USER ID FROM TOKEN:", user_id);
    console.log("EMAIL FROM REQUEST:", email);
    console.log("EXISTING USER:", existinguser);


    if (existinguser) {
      return next(new HttpError("Email already in use", 404));
    }
    const updatedfields ={
      firstName,email,lastName
    };
    if (imagePath) {
      updatedfields.image = imagePath;
     }

   const updatedusers = await User.findOneAndUpdate(
    { _id: user_id },
    updatedfields,
    {
        returnDocument: "after",
        runValidators: true
    }
    ).select("-password");

     if(!updatedusers){
      return next(new HttpError("Invalid credentials",400))
     }
     else{
    return res.status(201).json({
      success: true,
      message: "User updated successfully",
      data: updatedusers
    });
  }
  } catch (error) {
    return next(
      new HttpError(
        error.message || "Internal server error",
        500
      )
    );
  }

};


export const getOneUser = async (req,res,next)=>{
    try{
    const {user_id,user_role} =req.user_data;

    const user = await User.findById(user_id).select('-password')        

      if (!user) {
      return next(new HttpError("User not found", 404));
      }
      return res.status(200).json({
        success:true,
        data:user
     });

    }
    catch(error){
        return next(new HttpError(error.message ||"internal server error",500));
    }

};
