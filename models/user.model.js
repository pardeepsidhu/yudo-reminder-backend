import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
     type:String
    },
    otp:{
      type:String
    },
    telegram:{ 
      type:String
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
