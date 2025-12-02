import nodemailer from 'nodemailer'
import dotenv from "dotenv"
import mongoose from 'mongoose'
import Email from "../models/emial.model.js"
import schedule from 'node-schedule'
import axios from 'axios'
import moment from "moment-timezone";
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
    const mailBody = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL,
      to: receiver,
      subject: "Your Yudo Scheduler Verification Code",
      text: `Your verification code for Yudo Scheduler is ${opt}. This code will expire shortly. Please don't share it with anyone.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; font-size: 28px; margin: 0;">Yudo Scheduler</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin-top: 5px;">Verification Code</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;">Hello,</h2>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Please use the verification code below to complete your request:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #e8f4fc; border: 1px dashed #3498db; border-radius: 6px; padding: 15px 20px; display: inline-block;">
                <span style="font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #2980b9; letter-spacing: 5px;">${opt}</span>
              </div>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">This code will expire shortly and can only be used once.</p>
            <p style="color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;"><strong>Important:</strong> Never share this code with anyone. The Yudo Scheduler team will never ask for your verification code.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #95a5a6; font-size: 14px;">© ${new Date().getFullYear()} Yudo Scheduler. All rights reserved.</p>
            <p style="color: #95a5a6; font-size: 12px; margin-top: 10px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    }

    let res = await fetch(`${process.env.SECOND_APP}/api/v1/sendmail`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(mailBody)
    })

    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

export async function sendResetPasswordLink(link, receiver) {
  try {
    const mailBody = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL,
      to: receiver,
      subject: "Yudo Scheduler - Password Reset",
      text: `Please click the following link to reset your password: ${link}. This link will expire in 10 minutes. If you didn't request a reset, please ignore this email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; font-size: 28px; margin: 0;">Yudo Scheduler</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin-top: 5px;">Password Reset Request</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;">Hello,</h2>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">We received a request to reset your password for your Yudo Scheduler account. Click the button below to create a new password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;">Reset Password</a>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">This link will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #95a5a6; font-size: 14px;">© ${new Date().getFullYear()} Yudo Scheduler. All rights reserved.</p>
            <p style="color: #95a5a6; font-size: 12px; margin-top: 10px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    }

    await fetch(`${process.env.SECOND_APP}/api/v1/sendmail`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(mailBody)
    })
    return { success: true };
  } catch (error) {
    console.error("Error sending reset password link:", error);
    throw new Error("Failed to send reset password link");
  }
}

export async function sendQuickLoginLink(link, receiver) {
  try {
    const mailBody = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL,
      to: receiver,
      subject: "Yudo Scheduler - Quick Login Link",
      text: `Click the following link to log in quickly to your account: ${link}. This link will expire in 10 minutes. If you didn't request this, please ignore the email.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; font-size: 28px; margin: 0;">Yudo Scheduler</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin-top: 5px;">Quick Login Access</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;">Hello,</h2>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">You requested a quick login link for your Yudo Scheduler account. Click the button below to securely access your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;">Log In Now</a>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">This link will expire in <strong>10 minutes</strong> for your security.</p>
            <p style="color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;"><strong>Security Note:</strong> If you didn't request this login link, please ignore this email or contact support if you have concerns about your account security.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #95a5a6; font-size: 14px;">© ${new Date().getFullYear()} Yudo Scheduler. All rights reserved.</p>
            <p style="color: #95a5a6; font-size: 12px; margin-top: 10px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    }

    await fetch(`${process.env.SECOND_APP}/api/v1/sendmail`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(mailBody)
    })
    return { success: true };
    // return info;
  } catch (error) {
    console.error("Error sending quick login link:", error);
    throw new Error("Failed to send quick login link");
  }
}



async function sendTelegramLink(link, receiver) {
  try {
    const mailBody = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL,
      to: receiver,
      subject: "Yudo Scheduler - Connect to Telegram",
      text: `Click the following link to connect your Yudo Scheduler account with Telegram: ${link}. For security, please delete this email after connecting if desired.`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3498db; font-size: 28px; margin: 0;">Yudo Scheduler</h1>
            <p style="color: #7f8c8d; font-size: 16px; margin-top: 5px;">Telegram Connection</p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
            <h2 style="color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;">Hello,</h2>
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">Click the button below to connect your account with Telegram and receive updates:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" style="background-color: #0088cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;">
                <span style="vertical-align: middle;">Connect to Telegram</span>
                <span style="display: inline-block; vertical-align: middle; margin-left: 10px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.5 14.5l7.5-3.5-7.5-3.5v2.5l4.5 1-4.5 1v2.5z"/>
                  </svg>
                </span>
              </a>
            </div>
            
            <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Connecting to Telegram allows you to receive notifications and updates about your schedule directly through the Telegram messaging app.</p>
            <p style="color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;"><strong>Note:</strong> For security reasons, you may want to delete this email after connecting your account.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #95a5a6; font-size: 14px;">© ${new Date().getFullYear()} Yudo Scheduler. All rights reserved.</p>
            <p style="color: #95a5a6; font-size: 12px; margin-top: 10px;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    }

    await fetch(`${process.env.SECOND_APP}/api/v1/sendmail`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(mailBody)
    })
    return { success: true };

  } catch (error) {
    console.error("Error sending Telegram link:", error);
    throw new Error("Failed to send Telegram link");
  }
}

const scheduleEmail = async (req, res) => {
  try {
    const { subject, body, scheduleTime } = req.body;

    let to = req.user.email;
    let user = await User.findById(req.user._id);
    let telegram = user?.telegram;

    console.log("Received scheduleTime:", scheduleTime);

    if (!to || !subject || !body || !scheduleTime) {
      return res.status(400).json({ error: "Please provide valid data!" });
    }

    // ✅ Convert scheduleTime to a proper Date object in IST (Asia/Kolkata)
    // This ensures consistent scheduling even if the server runs in UTC
    const localDate = moment.tz(scheduleTime, "Asia/Kolkata").toDate();
    console.log("Converted local schedule time:", localDate);

    const jobId = new mongoose.Types.ObjectId().toString();

    // ✅ Schedule the job at the converted local time
    const job = schedule.scheduleJob(jobId, localDate, async () => {
      try {
        console.log("Executing scheduled job:", jobId);

        const mailBody = {
          EMAIL_PASS: process.env.EMAIL_PASS,
          EMAIL: process.env.EMAIL,
          from: process.env.EMAIL,
          to,
          subject,
          text: body,
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
              <h2 style="color: #4A90E2;">Yudo-Scheduler</h2>
              <p style="font-size: 16px; color: #333;">You have a scheduled reminder:</p>
              <p style="font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">
                ${body}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">Stay on track with Yudo-Scheduler.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">If you did not schedule this reminder, please ignore this email.</p>
            </div>
          `,
        };

        // Send email through your secondary app
        await fetch(`${process.env.SECOND_APP}/api/v1/sendmail`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mailBody),
        });

        // Update status in DB
        await Email.findOneAndUpdate({ jobId }, { status: "sent" });

        // Send Telegram message (if user connected)
        if (telegram) {
          const telBody = `<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong>: ${subject}\n<strong>Message</strong>: ${body}`;
          await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: telegram,
            text: telBody,
            parse_mode: "HTML",
          });
        }

        console.log("Job completed successfully:", jobId);
      } catch (err) {
        console.error("Error in scheduled job:", err);
      }
    });

    // Save scheduled email in DB
    const email = new Email({
      to,
      subject,
      body,
      scheduleTime: localDate,
      jobId,
      status: "pending",
    });

    await email.save();
    res.json({ message: "Email scheduled successfully", jobId });
  } catch (error) {
    console.error("Error scheduling email:", error);
    res.status(500).json({ error: "Failed to schedule email. Please try again." });
  }
};

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
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip) || 0;
    const status = req.query.status;

    // Build query object
    const query = { to: email };

    // Add status filter if provided
    if (status === 'pending' || status === 'sent') {
      query.status = status;
    }

    // Fetch emails with pagination and sorting
    let emails;
    if (limit) {
      emails = await Email.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    else {
      emails = await Email.find(query)
        .sort({ createdAt: -1 })
        .skip(skip);
    }


    // Get total count for pagination
    const total = await Email.countDocuments(query);


    res.send({
      total,
      emails
    });
  } catch (error) {

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
              <h2 style="color: #4A90E2;">Yudo-Scheduler</h2>
              <p style="font-size: 16px; color: #333;">You have a scheduled reminder:</p>
              <p style="font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">
                ${body || email.body}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">Stay on track with Yudo-Scheduler.</p>
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
          let telBody = `<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong> : ${subject || email.subject} \n<strong>Message</strong> : ${body || email.body}`;

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