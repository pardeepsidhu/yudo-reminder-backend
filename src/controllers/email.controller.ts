import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import schedule from 'node-schedule';
import axios from 'axios';
import moment from 'moment-timezone';
import { Request,Response } from 'express';

import {Email} from '../models/email.model';
import {User }from '../models/user.model';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

type MailPayload = {
  EMAIL_PASS?: string;
  EMAIL?: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};




const sendMailViaSecondApp = async (mailBody: MailPayload) => {
  const secondApp = process.env.SECOND_APP;

  if (!secondApp) {
    throw new Error('SECOND_APP is not configured');
  }

  const response = await fetch(`${secondApp}/api/v1/sendmail`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(mailBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unable to read error response');
    throw new Error(`Mail service failed: ${response.status} ${errorText}`);
  }

  return response;
};

// Send OTP function
async function sendOtpFun(opt: string | number, receiver: string) {
  try {
    const mailBody: MailPayload = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL || '',
      to: receiver,
      subject: 'Your Yudo Scheduler Verification Code',
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
    };

    await sendMailViaSecondApp(mailBody);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

export async function sendResetPasswordLink(link: string, receiver: string) {
  try {
    const mailBody: MailPayload = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL || '',
      to: receiver,
      subject: 'Yudo Scheduler - Password Reset',
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
    };

    await sendMailViaSecondApp(mailBody);
    return { success: true };
  } catch (error) {
    console.error('Error sending reset password link:', error);
    throw new Error('Failed to send reset password link');
  }
}

export async function sendQuickLoginLink(link: string, receiver: string) {
  try {
    const mailBody: MailPayload = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL || '',
      to: receiver,
      subject: 'Yudo Scheduler - Quick Login Link',
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
    };

    await sendMailViaSecondApp(mailBody);
    return { success: true };
  } catch (error) {
    console.error('Error sending quick login link:', error);
    throw new Error('Failed to send quick login link');
  }
}

async function sendTelegramLink(link: string, receiver: string) {
  try {
    const mailBody: MailPayload = {
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL: process.env.EMAIL,
      from: process.env.EMAIL || '',
      to: receiver,
      subject: 'Yudo Scheduler - Connect to Telegram',
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
    };

    await sendMailViaSecondApp(mailBody);
    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram link:', error);
    throw new Error('Failed to send Telegram link');
  }
}

const scheduleEmail = async (req: any, res: Response) => {
  try {
    const { subject, body, scheduleTime } = req.body;

    const to = req.user.email;
    const user = await User.findByPk(req.user.id);
    const telegram = (user as any)?.telegram ?? null;

    console.log('Received scheduleTime:', scheduleTime);

    if (!to || !subject || !body || !scheduleTime) {
      return res.status(400).json({ error: 'Please provide valid data!' });
    }

    const localDate = moment.tz(scheduleTime, 'Asia/Kolkata').toDate();

    if (Number.isNaN(localDate.getTime())) {
      return res.status(400).json({ error: 'Invalid schedule time provided!' });
    }

    if (localDate.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'Schedule time must be in the future!' });
    }

    console.log('Converted local schedule time:', localDate);

    const jobId = randomUUID();

    schedule.scheduleJob(jobId, localDate, async () => {
      try {
        console.log('Executing scheduled job:', jobId);

        const mailBody: MailPayload = {
          EMAIL_PASS: process.env.EMAIL_PASS,
          EMAIL: process.env.EMAIL,
          from: process.env.EMAIL || '',
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

        await sendMailViaSecondApp(mailBody);

        await Email.update({ status: 'sent' }, { where: { jobId } });

        if (telegram) {
          const telBody = `<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong>: ${subject}\n<strong>Message</strong>: ${body}`;
          await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: telegram,
            text: telBody,
            parse_mode: 'HTML',
          });
        }

        console.log('Job completed successfully:', jobId);
      } catch (err) {
        console.error('Error in scheduled job:', err);
      }
    });

    const email = await Email.create({
      to,
      subject,
      body,
      scheduleTime: localDate,
      jobId,
      status: 'pending',
    });

    return res.json({ message: 'Email scheduled successfully', jobId, email });
  } catch (error) {
    console.error('Error scheduling email:', error);
    return res.status(500).json({ error: 'Failed to schedule email. Please try again.' });
  }
};

const deleteSchedule = async (req: any, res: Response) => {
  try {
    const { jobId } = req.params;
    const email = await Email.findOne({ where: { jobId } });

    if (!email) {
      return res.status(404).send({ error: 'Schedule not found!' });
    }

    if ((email as any).to !== req.user.email) {
      return res.status(403).send({ error: 'Not authorized to delete this reminder!' });
    }

    const job = schedule.scheduledJobs[jobId];
    if (job) {
      job.cancel();
    }

    await Email.destroy({ where: { jobId } });

    return res.send({ message: 'Reminder deleted successfully!' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return res.status(500).send({ error: 'An error occurred while deleting the reminder.' });
  }
};

const getAll = async (req: any, res: Response) => {
  try {
    const email = req.user.email;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
    const skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
    const status = req.query.status;

    const whereClause: Record<string, any> = { to: email };

    if (status === 'pending' || status === 'sent') {
      whereClause.status = status;
    }

    const { count: total, rows: emails } = await Email.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      offset: skip,
      ...(limit ? { limit } : {}),
    });

    return res.send({
      total,
      emails,
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return res.status(400).send({ error: 'An error occurred while fetching reminders!' });
  }
};

const getOne = async (req: any, res: Response) => {
  try {
    const email = await Email.findByPk(req.params.id);

    if (!email) {
      return res.status(404).send({ error: 'Reminder not found!' });
    }

    if ((email as any).to !== req.user.email) {
      return res.status(403).send({ error: 'Not authorized to access this reminder!' });
    }

    return res.send(email);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    return res.status(500).send({ error: 'An error occurred while fetching the reminder.' });
  }
};

const updateSchedule = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, body, scheduleTime } = req.body;

    const email = await Email.findByPk(id);

    if (!email) {
      return res.status(404).send({ error: 'Reminder not found!' });
    }

    if ((email as any).to !== req.user.email) {
      return res.status(403).send({ error: 'Not authorized to update this reminder!' });
    }

    const existingJob = schedule.scheduledJobs[(email as any).jobId];
    if (existingJob) {
      existingJob.cancel();
    }

    const nextScheduleTime = scheduleTime
      ? moment.tz(scheduleTime, 'Asia/Kolkata').toDate()
      : new Date((email as any).scheduleTime);

    if (Number.isNaN(nextScheduleTime.getTime())) {
      return res.status(400).send({ error: 'Invalid schedule time provided!' });
    }

    if (nextScheduleTime.getTime() <= Date.now()) {
      return res.status(400).send({ error: 'Schedule time must be in the future!' });
    }

    const nextSubject = subject || (email as any).subject;
    const nextBody = body || (email as any).body;
    const jobId = randomUUID();

    schedule.scheduleJob(jobId, nextScheduleTime, async () => {
      try {
        const mailBody: MailPayload = {
          EMAIL_PASS: process.env.EMAIL_PASS,
          EMAIL: process.env.EMAIL,
          from: process.env.EMAIL || '',
          to: (email as any).to,
          subject: nextSubject,
          text: nextBody,
          html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;">
              <h2 style="color: #4A90E2;">Yudo-Scheduler</h2>
              <p style="font-size: 16px; color: #333;">You have a scheduled reminder:</p>
              <p style="font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;">
                ${nextBody}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">Stay on track with Yudo-Scheduler.</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #999;">If you did not schedule this reminder, please ignore this email.</p>
            </div>
          `,
        };

        await sendMailViaSecondApp(mailBody);

        await Email.update({ status: 'sent' }, { where: { id } });

        const user = await User.findOne({ where: { email: (email as any).to } });
        if ((user as any)?.telegram) {
          const telBody = `<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong> : ${nextSubject} \n<strong>Message</strong> : ${nextBody}`;

          await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
            chat_id: (user as any).telegram,
            text: telBody,
            parse_mode: 'HTML',
          });
        }
      } catch (err) {
        console.error('Error in scheduled job:', err);
      }
    });

    await email.update({
      subject: nextSubject,
      body: nextBody,
      scheduleTime: nextScheduleTime,
      jobId,
      status: 'pending',
    });

    return res.send({ message: 'Reminder updated successfully', jobId });
  } catch (error) {
    console.error('Error updating reminder:', error);
    return res.status(500).send({ error: 'An error occurred while updating the reminder.' });
  }
};

export {
  sendOtpFun,
  scheduleEmail,
  deleteSchedule,
  getAll,
  getOne,
  sendTelegramLink,
  updateSchedule,
};