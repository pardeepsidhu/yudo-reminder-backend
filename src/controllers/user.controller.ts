import dotenv from "dotenv";
import {User} from "../models/user.model";
import {
  sendOtpFun,
  sendQuickLoginLink,
  sendResetPasswordLink,
  sendTelegramLink,
} from "./email.controller";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { createNotification } from "./notification.controller";
import { Request } from "express";

dotenv.config();

const sendOtp = async (req:any, res:any) => {
  try {
    let { password, email } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .send({ error: "Please fill all fields with valid info." });
    }

    let user = await User.findOne({
      where: { email },
    });

    // If user exists and OTP already verified
    if (user && (user as any).otp === "verified") {
      return res
        .status(400)
        .send({ error: "User already exists. Please log in!" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let hashedPass = await bcrypt.hash(password, 8);

    if (!user) {
      // Create new user
      user = await User.create({
        email,
        otp,
        password: hashedPass,
        telegram: "",
      });
    } else {
      // Update existing user
      await User.update(
        {
          otp,
          password: hashedPass,
        },
        {
          where: { email },
        }
      );
    }

    // Send OTP email
    await sendOtpFun(otp, email);

    return res
      .status(200)
      .send({ message: "OTP sent successfully!", otp });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      error: "An error occurred while creating the user!",
    });
  }
};

const verifyOtp = async (req:any, res:any) => {
  try {
    let { otp, email } = req.body;

    if (!otp || !email) {
      return res.send({ error: "Please enter valid data" });
    }

    let user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).send({
        error: "User not found!",
      });
    }

    if ((user as any).otp == "verified") {
      return res.status(404).send({
        error: "User Already Exist Please Login !",
      });
    }

    if ((user as any).otp != otp) {
      return res.send({
        error: "Please enter valid otp",
      });
    }

    await User.update(
      {
        otp: "verified",
      },
      {
        where: { email },
      }
    );

    const link = `https://t.me/${
      process.env.BOT_USERNAME
    }?start=${encodeURIComponent((user as any).id)}`;

    await sendTelegramLink(link, email);

    user = await User.findOne({
      where: { email },
    });

    if(!user)   return res.status(500).send({
      error: "Some error occurred while verifying OTP.",
    });
    
    user = user.toJSON();

    delete (user as any).password;

    let token = jwt.sign(user as any, process.env.JWT_SECRET as string);

    let notificationData = {
      title: "Telegram email sent",
      type: "telegram",
      description:
        "You have successfuly recieved telegram conection link , Please check your email inbox ,  Stay updated a keep connected with yudo-scheduler",
      user: (user as any).id,
    };

    await createNotification(notificationData);

    return res.send({ token });
  } catch (error) {
    console.error(error);

    return res.status(500).send({
      error: "Some error occurred while verifying OTP.",
    });
  }
};

const login = async (req:any, res:any) => {
  try {
    let { email, password } = req.body;

    if (!email) {
      return res.status(404).send({
        error: "user not found !",
      });
    }

    let user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(404).send({
        error: "user not found !",
      });
    }

    if ((user as any).otp != "verified") {
      return res.status(400).send({
        error: "user not verified !",
      });
    }

    let compairPassword = await bcrypt.compare(
      password,
      (user as any).password
    );

    if (!compairPassword) {
      return res.status(404).send({
        error: "email or password is wrong !",
      });
    }

    user = user.toJSON();

    let notificationData = {
      title: "Logged in successfuly",
      type: "yudo",
      description:
        "Welcome back , You have successfuly logged in with yudo-scheduler ,  Stay updated a keep connected with yudo-scheduler",
      user: (user as any).id,
    };

    await createNotification(notificationData);

    delete (user as any).password;

    let token = jwt.sign(user as any, process.env.JWT_SECRET as string);

    return res.send({ token });
  } catch (error) {
    console.log(error);

    return res.status(400).send({
      error: "some internal error accured !",
    });
  }
};

const getProfile = async (req:any, res:any) => {
  try {
    let userId = req.user.id;

    if (!userId) {
      return res.status(401).send({
        error: "unauthorized user !",
      });
    }

    let user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).send({
        error: "unauthorized user !",
      });
    }

    user = user.toJSON();

    delete (user as any).password;

    res.send(user);
  } catch (error) {
    console.log(error);

    res.status(400).send({
      error: "some error accured while fetching user !",
    });
  }
};

const updateProfile = async (req:any, res:any) => {
  try {
    let userId = req.user.id;

    const { name, profile } = req.body;

    if (!userId) {
      return res.status(401).send({
        error: "unauthorized user!",
      });
    }

    let user = await User.findByPk(userId);

    if (!user) {
      return res.status(401).send({
        error: "unauthorized user!",
      });
    }

    const updateFields:{name ?:string,profile ?:string} = {};

    if (name !== undefined) {
      updateFields.name = name;
    }

    if (profile !== undefined) {
      updateFields.profile = profile;
    }

    if (Object.keys(updateFields).length > 0) {
      await User.update(updateFields, {
        where: { id: userId },
      });

      res.send({
        message: "profile updated",
      });
    } else {
      res.send({
        message: "no fields to update",
      });
    }
  } catch (error) {
    console.log(error);

    res.status(400).send({
      error: "some error occurred while updating user!",
    });
  }
};

const resetPasswordLink = async (req:any, res:any) => {
  try {
    const email = req.user?.email || req.query?.email;

    if (!email) {
      return res.status(401).send({
        error: "Unauthorized user!",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).send({
        error: "Unauthorized user!",
      });
    }

    const resetId = (user as any).id;

    const token = jwt.sign(
      {
        resetId,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "10m",
      }
    );

    const resetLink = `https://yudo-scheduler.vercel.app/login/?resetId=${token}`;

    await sendResetPasswordLink(resetLink, (user as any).email);

    let notificationData = {
      title: "Change password email sent",
      type: "auth",
      description:
        "You have successfuly recieved reset password link , Please check your email inbox and insure it will expire in 10 minutes  ,  Stay updated a keep connected with yudo-scheduler",
      user: (user as any).id,
    };

    await createNotification(notificationData);

    res.status(200).send({
      message: "Password reset link generated successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(400).send({
      error:
        "Some error occurred while generating password reset link!",
    });
  }
};

const resetPassword = async (req:any, res:any) => {
  try {
    const token = req.query.resetId;

    const newPassword = req.body.password;

    // Verify JWT
    const data = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const userId = (data as any).resetId;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      8
    );

    (user as any).password = hashedPassword;

    await user.save();

    let notificationData = {
      title: "Change password email sent",
      type: "auth",
      description:
        "Your password has been reset successfuly ,  Stay updated a keep connected with yudo-scheduler",
      user: (user as any).id,
    };

    await createNotification(notificationData);

    res.status(200).json({
      message: "Password has been successfully reset.",
    });
  } catch (error) {
    console.error(error);

    if ((error as any).name === "TokenExpiredError") {
      return res.status(400).json({
        error: "Reset link has expired.",
      });
    }

    res.status(400).json({
      error:
        "Some error occurred while resetting password!",
    });
  }
};

const quickLoginLink = async (req:any, res:any) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(401).send({
        error: "Unauthorized user!",
      });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).send({
        error: "Unauthorized user!",
      });
    }

    const token = jwt.sign(
      {
        userId: (user as any).id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "10m",
      }
    );

    const quickLoginLink = `https://yudo-scheduler.vercel.app/quick-login?token=${token}`;

    await sendQuickLoginLink(
      quickLoginLink,
      (user as any).email
    );

    res.status(200).send({
      message:
        "Quick login link generated successfully!",
    });
  } catch (error) {
    console.error(
      "Error generating quick login link:",
      error
    );

    res.status(400).send({
      error:
        "Some error occurred while generating quick login link!",
    });
  }
};

const quickLogin = async (req:any, res:any) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).json({
        error: "Token is required.",
      });
    }

    const data = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    const userId = (data as any).userId;

    let user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    user = user.toJSON();

    delete (user as any).password;

    const loginToken = jwt.sign(
      user as any,
      process.env.JWT_SECRET as string
    );

    let notificationData = {
      title: "Logged in successfuly",
      type: "yudo",
      description:
        "Welcome back , You have successfuly logged in with yudo-scheduler using quick login link ,  Stay updated a keep connected with yudo-scheduler",
      user: (user as any).id,
    };

    await createNotification(notificationData);

    res.status(200).json({
      token: loginToken,
    });
  } catch (error) {
    console.error("Quick login error:", error);

    if ((error as any).name === "TokenExpiredError") {
      return res.status(400).json({
        error: "Login link has expired.",
      });
    }

    res.status(400).json({
      error:
        "Some error occurred while logging in!",
    });
  }
};

export {
  sendOtp,
  verifyOtp,
  login,
  getProfile,
  updateProfile,
  resetPasswordLink,
  resetPassword,
  quickLoginLink,
  quickLogin,
};