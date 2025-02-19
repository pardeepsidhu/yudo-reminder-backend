import dotenv from 'dotenv'
import User from '../models/user.model.js'
import { sendOtpFun, sendTelegramLink } from './email.contoller.js';
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken"
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
        delete user.password;
        let token = jwt.sign(user,process.env.JWT_SECRET)
        return res.send({token})
    } catch (error) {
        console.log(error);
        return res.status(400).send({error:'some internal error accured !'})
    }
}

export {sendOtp,verifyOtp,login}