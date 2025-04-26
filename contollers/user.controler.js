import dotenv from 'dotenv'
import User from '../models/user.model.js'
import { sendOtpFun, sendQuickLoginLink, sendResetPasswordLink, sendTelegramLink } from './email.contoller.js';
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose';
import { createNotification } from './notification.controller.js';
dotenv.config("../.env")


const sendOtp = async (req, res) => {
    try {
        let { password, email } = req.body;

        if (!email || !password) {
            return res.status(400).send({ error: "Please fill all fields with valid info." });
        }

        let user = await User.findOne({ email });

        // If user exists and OTP is already verified
        if (user && user.otp === "verified") {
            return res.status(400).send({ error: "User already exists. Please log in!" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        let hashedPass = await bcrypt.hash(password, 8);

        if (!user) {
            // Create new user if not found
            user = new User({ email, otp, password: hashedPass,telegram:"" });
            await user.save();
        } else {
            // Update existing user's OTP and password
            await User.updateOne({ email }, { $set: { otp, password: hashedPass } });
        }

        // Send OTP email
        await sendOtpFun(otp, email);

        return res.status(200).send({ message: "OTP sent successfully!", otp });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "An error occurred while creating the user!" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        let { otp, email } = req.body;

        if (!otp || !email) return res.send({ error: 'Please enter valid data' });

        let user = await User.findOne({ email });
        
        if (!user) return res.status(404).send({ error: "User not found!" });
        if(user.otp=="verified") return res.status(404).send({ error: "User Already Exist Please Login !" }); 
        if (user.otp != otp) return res.send({ error: "Please enter valid otp" });

        await User.updateOne({ email }, { $set: { otp: "verified" } });
        const link = `https://t.me/${process.env.BOT_USERNAME}?start=${encodeURIComponent(user._id)}`;
        await sendTelegramLink(link,email);
        user = await User.findOne({ email }); 
        // console.log("this i suser "+ user)
        user = user.toObject();
        delete user.password;
        let token = jwt.sign(user, process.env.JWT_SECRET);

        let notificationData = {
          title: 'Telegram email sent',
          type: 'telegram',
          description: 'You have successfuly recieved telegram conection link , Please check your email inbox ,  Stay updated a keep connected with yudo-scheduler',
          user: user._id
        }
        await createNotification(notificationData);

        return res.send({ token });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: 'Some error occurred while verifying OTP.' });
    }
};


const login = async (req,res)=>{
    try {
        let {email,password}= req.body;
        if(!email) return res.status(404).send({error:"user not found !"})
        let user = await User.findOne({email})
        if(!user) return res.status(404).send({error:"user not found !"})
        if(user.otp != "verified")return res.status(400).send({error:"user not verified !"});
        let compairPassword = await bcrypt.compare(password,user.password);
        if(!compairPassword) return res.status(404).send({error:"email or password is wrong !"})
        user = user.toObject();
        let notificationData = {
          title: 'Logged in successfuly',
          type: 'yudo',
          description: 'Welcome back , You have successfuly logged in with yudo-scheduler ,  Stay updated a keep connected with yudo-scheduler',
          user: user._id
        }
        await createNotification(notificationData);
        delete user.password;
        let token = jwt.sign(user,process.env.JWT_SECRET)
        return res.send({token})
    } catch (error) {
        console.log(error);
        return res.status(400).send({error:'some internal error accured !'})
    }
}

const getProfile=async(req,res)=>{
    try {
        let userId = req.user._id;
        console.log(userId);
        if(!userId){
            return res.status(401).send({error:"unauthorized user !"})
        }
        let user  = await User.findById(userId);
        if(!user) return res.status(401).send({error:"unauthorized user !"})
        user = user.toObject()
        delete user.password;
        res.send(user);
    } catch (error) {
        console.log(error)
        res.status(400).send({error:"some error accured while fetching user !"})
    }
}


const updateProfile = async (req, res) => {
    try {
      let userId = req.user._id;
      console.log("hello");
      const { name, profile } = req.body;
      console.log(name, profile);
      
      if (!userId) {
        return res.status(401).send({ error: "unauthorized user!" });
      }
      
      let user = await User.findById(userId);
      if (!user) return res.status(401).send({ error: "unauthorized user!" });
      
      // Create update object with only the fields that are provided
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (profile !== undefined) updateFields.profile = profile;
      
      // Only update if there are fields to update
      if (Object.keys(updateFields).length > 0) {
        let updateResult = await User.updateOne({ _id: userId }, updateFields);
        res.send({ message: "profile updated" });
      } else {
        res.send({ message: "no fields to update" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: "some error occurred while updating user!" });
    }
  };


  const resetPasswordLink = async (req, res) => {
    try {
      const email = req.user?.email || req.query?.email;
      console.log(req.user)
      console.log(email)
      if (!email) {
        return res.status(401).send({ error: "Unauthorized user!" });
      }
      
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(401).send({ error: "Unauthorized user!" });
      }
      
      const resetId = user._id;
   
      const token = jwt.sign(
        {
          resetId,
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
     
  
      // Generate reset link
      const resetLink = `https://yudo-scheduler.vercel.app/login/?resetId=${token}`;
      
      await sendResetPasswordLink(resetLink,user.email);

      let notificationData = {
        title: 'Change password email sent',
        type: 'auth',
        description: 'You have successfuly recieved reset password link , Please check your email inbox and insure it will expire in 10 minutes  ,  Stay updated a keep connected with yudo-scheduler',
        user: user._id
      }
      await createNotification(notificationData);
      // Send success response with reset link
      res.status(200).send({ 
        message: "Password reset link generated successfully", 
      });
      
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: "Some error occurred while generating password reset link!" });
    }
  };


  const resetPassword = async (req, res) => {
    try {
      const token = req.query.resetId;
      const newPassword = req.body.password;
  
      // 1. Verify JWT and check expiry
      const data = jwt.verify(token, process.env.JWT_SECRET); // Throws error if expired
      const userId = data.resetId;
  console.log(data)
      // 2. Find the user by ID
      console.log(userId)
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // 3. Hash the new password
    
      const hashedPassword = await bcrypt.hash(newPassword, 8);
  
      // 4. Update the user's password
      user.password = hashedPassword;
      await user.save();
  
      let notificationData = {
        title: 'Change password email sent',
        type: 'auth',
        description: 'You have successfuly reset your yudo-scheduler password  ,  Stay updated a keep connected with yudo-scheduler',
        user: user._id
      }
      await createNotification(notificationData);

      res.status(200).json({ message: "Password has been successfully reset." });
    } catch (error) {
      console.error(error);
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ error: "Reset link has expired." });
      }
      res.status(400).json({ error: "Some error occurred while resetting password!" });
    }
  };



  const quickLoginLink = async (req, res) => {
    try {
      // Extract email from authenticated user or query params
      const email = req.body.email
      console.log(email);
  
      if (!email) {
        return res.status(401).send({ error: "Unauthorized user!" });
      }
  
      // Find user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).send({ error: "Unauthorized user!" });
      }
  
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // Token valid for 10 minutes
      );
  
      // Optional: save login token or flag if needed
      
  
      // Generate quick login link
      const quickLoginLink = `https://yudo-scheduler.vercel.app/quick-login?token=${token}`;
  
      // Send quick login email
      console.log("user email : "+user.email)
     await sendQuickLoginLink(quickLoginLink, user.email);

  


      res.status(200).send({
        message: "Quick login link generated successfully!",
      });
    } catch (error) {
      console.error("Error generating quick login link:", error);
      res.status(400).send({
        error: "Some error occurred while generating quick login link!",
      });
    }
  };
  
  const quickLogin = async (req, res) => {
    try {
      const token = req.query.token;
  
      if (!token) {
        return res.status(400).json({ error: "Token is required." });
      }
  
      // 1. Verify JWT and check expiry
      const data = jwt.verify(token, process.env.JWT_SECRET); // Throws if expired
      console.log(data)
      const userId = data.userId;
      console.log("Decoded Token:", data);
  
      // 2. Find user by ID
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      user = user.toObject()
      delete user.password;
    
      const loginToken = jwt.sign(user,process.env.JWT_SECRET);
  
      let notificationData = {
        title: 'Logged in successfuly',
        type: 'yudo',
        description: 'Welcome back , You have successfuly logged in with yudo-scheduler using quick login link ,  Stay updated a keep connected with yudo-scheduler',
        user: user._id
      }
      await createNotification(notificationData);
      
      res.status(200).json({token: loginToken});
    } catch (error) {
      console.error("Quick login error:", error);
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ error: "Login link has expired." });
      }
      res.status(400).json({ error: "Some error occurred while logging in!" });
    }
  };
export {sendOtp,verifyOtp,login,getProfile,updateProfile,resetPasswordLink,resetPassword ,quickLoginLink,quickLogin}