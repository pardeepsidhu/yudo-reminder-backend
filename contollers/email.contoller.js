
import nodemailer from 'nodemailer'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import Email from "../models/emial.model.js"
import  schedule  from 'node-schedule'
dotenv.config("../.env")



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendOtpFun(opt, receiver) {
  try {
    // console.log(req.body)
    const info = await transporter.sendMail({
      from: process.env.EMAIL, // Sender address
      to: receiver, // Recipient email
      subject: "Your Yudo-Reminder OTP", // Subject line
      text: `Your OTP for Yudo-Reminder is ${opt}. Please don't share it with anyone.`, // Plain text body
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #4A90E2;">Yudo-Reminder OTP</h2>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) is:</p>
          <p style="font-size: 22px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">${opt}</p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">Please do not share this OTP with anyone. It is valid for a limited time.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">If you did not request this OTP, please ignore this email.</p>
        </div>
      `, // HTML body
    });

    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}


import cron from "node-cron";



    // setEmails(emails.filter((email) => email.id !== deleteId));


const scheduleEmail = async (req, res) => {
  try {
  const {  subject, body, scheduleTime } = req.body;
  let to = req.user.email;
  if(!to || !subject || !body ||!scheduleTime) return res.status(400).send({error:"Please Provide Valid Data !"})
  const jobId = new mongoose.Types.ObjectId().toString();
  
  const job = schedule.scheduleJob(jobId, new Date(scheduleTime), async () => {
    
      const info = await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject,
        text: body,
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
            <h2 style="color: #4A90E2;">Yudo-Reminder</h2>
            <p style="font-size: 16px; color: #333;">You have a scheduled reminder:</p>
            <p style="font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">
              ${body}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 10px;">Stay on track with Yudo-Reminder.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">If you did not schedule this reminder, please ignore this email.</p>
          </div>
        `,
      });
  
      console.log(`Scheduled email sent to ${to} at ${scheduleTime}. Message ID: ${info.messageId}`);
   
  });

  const email = new Email({ to, subject, body, scheduleTime, jobId });
  await email.save();
  res.json({ message: "Email scheduled successfully", jobId });
} catch (error) {
  console.error(`Error sending scheduled email to ${to}:`, error);
}
}




const deleteSchedule = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = schedule.scheduledJobs[jobId];
    if (job) {
        job.cancel();
    } 
    await Email.deleteOne({jobId});
    res.send({message:"job deleted !"})
  } catch (error) {
    res.status(400).send({error:"Some Internal Error Accured !"})
  }
 
}

const getAll = async(req,res)=>{
  try {
    let email = req.user.email;
    let {limit} =req.params;
    let emails = await Email.find({to:email}).limit(limit)
    let count = await Email.find({to:email})
    res.send({total:count.length,emails})
  } catch (error) {
    console.log(error);
    res.status(400).send({error:"some error accured while fetching schedules !"})
  }
}

const getOne = async(req,res)=>{
  try {
    let email = await Email.findOne({_id:req.params.id})
    if(!email) return res.status(404).send({error:'schedule not found !'});
    res.send(email)
  } catch (error) {
    console.log(error);
    res.status(400).send({error:"some error accured while fetching schedules !"})
  }
}

export {sendOtpFun,scheduleEmail,deleteSchedule,getAll,getOne}
