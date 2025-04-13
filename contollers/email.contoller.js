import nodemailer from 'nodemailer'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import Email from "../models/emial.model.js"
import schedule from 'node-schedule'
import axios from 'axios'
import User from "../models/user.model.js"

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

// Send OTP function
async function sendOtpFun(opt, receiver) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: receiver,
      subject: "Your Yudo-Scheduler OTP",
      text: `Your OTP for Yudo-Scheduler is ${opt}. Please don't share it with anyone.`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #4A90E2;">Yudo-Reminder OTP</h2>
          <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) is:</p>
          <p style="font-size: 22px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">${opt}</p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">Please do not share this OTP with anyone. It is valid for a limited time.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">If you did not request this OTP, please ignore this email.</p>
        </div>
      `,
    });

    console.log("Email sent: ", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

async function sendTelegramLink(link, receiver) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: receiver, 
      subject: "Yudo-Sheduler Telegram Link",
      text: `please clink the link ${link} to be updated through telegram as well. please delete this email for security reasons if you don't want .`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
          <h2 style="color: #4A90E2;">Yudo Reminder Telegram Verificaton</h2>
          <p style="font-size: 16px; color: #333;">your telegram bot link is : </p>
          <p style="font-size: 22px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;"><a href=${link}>telegram <a/></p>
          <p style="font-size: 14px; color: #666; margin-top: 10px;">please delete this email for security reasons if you don't want .</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">If you did not request this Email, please ignore this email.</p>
        </div>
      `,
    });
    return info;
  } catch (error) {
    console.error("Error sending Telegram link:", error);
    throw new Error("Failed to send Telegram link");
  }
}

const scheduleEmail = async (req, res) => {
  try {
    const { subject, body, scheduleTime } = req.body;
    let to = req.user.email;
    let user = await User.findOne({_id: req.user._id});
    let telegram = user.telegram;
    
    if(!to || !subject || !body || !scheduleTime) {
      return res.status(400).send({error:"Please Provide Valid Data!"});
    }
    
    const jobId = new mongoose.Types.ObjectId().toString();
    
    const job = schedule.scheduleJob(jobId, new Date(scheduleTime), async () => {
      try {
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

        // Update email status to 'sent' in the database
        await Email.findOneAndUpdate({ jobId }, { status: 'sent' });

        if(telegram) {
          let telBody = `<strong>Reminder From Yudo-Reminder</strong>\n<strong>Subject</strong> : ${subject} \n<strong>Message</strong> : ${body}`;

          await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: telegram,
            text: telBody,
            parse_mode: 'HTML'  
          });
          console.log("Telegram notification sent");
        }
      } catch (err) {
        console.error("Error in scheduled job:", err);
      }
    });

    const email = new Email({ 
      to, 
      subject, 
      body, 
      scheduleTime, 
      jobId,
      status: 'pending' // Initial status as pending
    });
    
    await email.save();
    res.json({ message: "Email scheduled successfully", jobId });
  } catch (error) {
    console.error("Error scheduling email:", error);
    res.status(500).send({ error: "Failed to schedule email. Please try again." });
  }
}

const deleteSchedule = async (req, res) => {
  try {
    const { jobId } = req.params;
    const email = await Email.findOne({ jobId });
    
    if (!email) {
      return res.status(404).send({ error: "Schedule not found!" });
    }
    
    // Check if user owns this reminder
    if (email.to !== req.user.email) {
      return res.status(403).send({ error: "Not authorized to delete this reminder!" });
    }

    // Cancel the job if it's still scheduled
    const job = schedule.scheduledJobs[jobId];
    if (job) {
      job.cancel();
    } 
    
    await Email.deleteOne({ jobId });
    res.send({ message: "Reminder deleted successfully!" });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).send({ error: "An error occurred while deleting the reminder." });
  }
}

const getAll = async (req, res) => {
  try {
    const email = req.user.email;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;
    const status = req.query.status;

    // Build query object
    const query = { to: email };
    
    // Add status filter if provided
    if (status === 'pending' || status === 'sent') {
      query.status = status;
    }

    // Fetch emails with pagination and sorting
    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Email.countDocuments(query);

    res.send({
      total,
      emails
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "An error occurred while fetching reminders!" });
  }
};

const getOne = async (req, res) => {
  try {
    const email = await Email.findOne({ _id: req.params.id });
    
    if (!email) {
      return res.status(404).send({ error: 'Reminder not found!' });
    }
    
    // Check if user owns this reminder
    if (email.to !== req.user.email) {
      return res.status(403).send({ error: "Not authorized to access this reminder!" });
    }
    
    res.send(email);
  } catch (error) {
    console.error("Error fetching reminder:", error);
    res.status(500).send({ error: "An error occurred while fetching the reminder." });
  }
}

// New function to update a reminder
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, body, scheduleTime } = req.body;
    
    // Find the email by ID
    const email = await Email.findById(id);
    
    if (!email) {
      return res.status(404).send({ error: "Reminder not found!" });
    }
    
    // Check if user owns this reminder
    if (email.to !== req.user.email) {
      return res.status(403).send({ error: "Not authorized to update this reminder!" });
    }
    
    // Cancel existing job if it exists
    const job = schedule.scheduledJobs[email.jobId];
    if (job) {
      job.cancel();
    }
    
    // Create a new job ID
    const jobId = new mongoose.Types.ObjectId().toString();
    
    // Schedule new job
    schedule.scheduleJob(jobId, new Date(scheduleTime), async () => {
      try {
        const info = await transporter.sendMail({
          from: process.env.EMAIL,
          to: email.to,
          subject: subject || email.subject,
          text: body || email.body,
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
              <h2 style="color: #4A90E2;">Yudo-Reminder</h2>
              <p style="font-size: 16px; color: #333;">You have a scheduled reminder:</p>
              <p style="font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">
                ${body || email.body}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">Stay on track with Yudo-Reminder.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">If you did not schedule this reminder, please ignore this email.</p>
            </div>
          `,
        });

        // Update email status to 'sent'
        await Email.findByIdAndUpdate(id, { status: 'sent' });

        // Send telegram notification if enabled
        let user = await User.findOne({ email: email.to });
        if (user && user.telegram) {
          let telBody = `<strong>Reminder From Yudo-Reminder</strong>\n<strong>Subject</strong> : ${subject || email.subject} \n<strong>Message</strong> : ${body || email.body}`;

          await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: user.telegram,
            text: telBody,
            parse_mode: 'HTML'  
          });
        }
      } catch (err) {
        console.error("Error in scheduled job:", err);
      }
    });
    
    // Update email in database
    await Email.findByIdAndUpdate(id, {
      subject: subject || email.subject,
      body: body || email.body,
      scheduleTime: scheduleTime || email.scheduleTime,
      jobId: jobId,
      status: 'pending'
    });
    
    res.send({ message: "Reminder updated successfully", jobId });
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).send({ error: "An error occurred while updating the reminder." });
  }
}

export {
  sendOtpFun,
  scheduleEmail,
  deleteSchedule,
  getAll,
  getOne,
  sendTelegramLink,
  updateSchedule
}