"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSchedule = exports.sendTelegramLink = exports.getOne = exports.getAll = exports.deleteSchedule = exports.scheduleEmail = exports.sendOtpFun = exports.sendQuickLoginLink = exports.sendResetPasswordLink = void 0;
var nodemailer_1 = require("nodemailer");
var dotenv_1 = require("dotenv");
var crypto_1 = require("crypto");
var node_schedule_1 = require("node-schedule");
var axios_1 = require("axios");
var moment_timezone_1 = require("moment-timezone");
var email_model_1 = require("../models/email.model");
var user_model_1 = require("../models/user.model");
dotenv_1.default.config();
var transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});
var sendMailViaSecondApp = function (mailBody) { return __awaiter(void 0, void 0, void 0, function () {
    var secondApp, response, errorText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                secondApp = process.env.SECOND_APP;
                if (!secondApp) {
                    throw new Error('SECOND_APP is not configured');
                }
                return [4 /*yield*/, fetch("".concat(secondApp, "/api/v1/sendmail"), {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                        },
                        body: JSON.stringify(mailBody),
                    })];
            case 1:
                response = _a.sent();
                if (!!response.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, response.text().catch(function () { return 'Unable to read error response'; })];
            case 2:
                errorText = _a.sent();
                throw new Error("Mail service failed: ".concat(response.status, " ").concat(errorText));
            case 3: return [2 /*return*/, response];
        }
    });
}); };
// Send OTP function
function sendOtpFun(opt, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var mailBody, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mailBody = {
                        EMAIL_PASS: process.env.EMAIL_PASS,
                        EMAIL: process.env.EMAIL,
                        from: process.env.EMAIL || '',
                        to: receiver,
                        subject: 'Your Yudo Scheduler Verification Code',
                        text: "Your verification code for Yudo Scheduler is ".concat(opt, ". This code will expire shortly. Please don't share it with anyone."),
                        html: "\n        <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n          <div style=\"text-align: center; margin-bottom: 30px;\">\n            <h1 style=\"color: #3498db; font-size: 28px; margin: 0;\">Yudo Scheduler</h1>\n            <p style=\"color: #7f8c8d; font-size: 16px; margin-top: 5px;\">Verification Code</p>\n          </div>\n\n          <div style=\"background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);\">\n            <h2 style=\"color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;\">Hello,</h2>\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;\">Please use the verification code below to complete your request:</p>\n\n            <div style=\"text-align: center; margin: 30px 0;\">\n              <div style=\"background-color: #e8f4fc; border: 1px dashed #3498db; border-radius: 6px; padding: 15px 20px; display: inline-block;\">\n                <span style=\"font-family: 'Courier New', monospace; font-size: 28px; font-weight: bold; color: #2980b9; letter-spacing: 5px;\">".concat(opt, "</span>\n              </div>\n            </div>\n\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;\">This code will expire shortly and can only be used once.</p>\n            <p style=\"color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;\"><strong>Important:</strong> Never share this code with anyone. The Yudo Scheduler team will never ask for your verification code.</p>\n          </div>\n\n          <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;\">\n            <p style=\"color: #95a5a6; font-size: 14px;\">\u00A9 ").concat(new Date().getFullYear(), " Yudo Scheduler. All rights reserved.</p>\n            <p style=\"color: #95a5a6; font-size: 12px; margin-top: 10px;\">This is an automated message, please do not reply.</p>\n          </div>\n        </div>\n      "),
                    };
                    return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error sending OTP:', error_1);
                    throw new Error('Failed to send OTP');
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendOtpFun = sendOtpFun;
function sendResetPasswordLink(link, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var mailBody, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mailBody = {
                        EMAIL_PASS: process.env.EMAIL_PASS,
                        EMAIL: process.env.EMAIL,
                        from: process.env.EMAIL || '',
                        to: receiver,
                        subject: 'Yudo Scheduler - Password Reset',
                        text: "Please click the following link to reset your password: ".concat(link, ". This link will expire in 10 minutes. If you didn't request a reset, please ignore this email."),
                        html: "\n        <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n          <div style=\"text-align: center; margin-bottom: 30px;\">\n            <h1 style=\"color: #3498db; font-size: 28px; margin: 0;\">Yudo Scheduler</h1>\n            <p style=\"color: #7f8c8d; font-size: 16px; margin-top: 5px;\">Password Reset Request</p>\n          </div>\n\n          <div style=\"background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);\">\n            <h2 style=\"color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;\">Hello,</h2>\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;\">We received a request to reset your password for your Yudo Scheduler account. Click the button below to create a new password.</p>\n\n            <div style=\"text-align: center; margin: 30px 0;\">\n              <a href=\"".concat(link, "\" style=\"background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;\">Reset Password</a>\n            </div>\n\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;\">This link will expire in <strong>10 minutes</strong>.</p>\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6;\">If you didn't request a password reset, you can safely ignore this email.</p>\n          </div>\n\n          <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;\">\n            <p style=\"color: #95a5a6; font-size: 14px;\">\u00A9 ").concat(new Date().getFullYear(), " Yudo Scheduler. All rights reserved.</p>\n            <p style=\"color: #95a5a6; font-size: 12px; margin-top: 10px;\">This is an automated message, please do not reply.</p>\n          </div>\n        </div>\n      "),
                    };
                    return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error sending reset password link:', error_2);
                    throw new Error('Failed to send reset password link');
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendResetPasswordLink = sendResetPasswordLink;
function sendQuickLoginLink(link, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var mailBody, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mailBody = {
                        EMAIL_PASS: process.env.EMAIL_PASS,
                        EMAIL: process.env.EMAIL,
                        from: process.env.EMAIL || '',
                        to: receiver,
                        subject: 'Yudo Scheduler - Quick Login Link',
                        text: "Click the following link to log in quickly to your account: ".concat(link, ". This link will expire in 10 minutes. If you didn't request this, please ignore the email."),
                        html: "\n        <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n          <div style=\"text-align: center; margin-bottom: 30px;\">\n            <h1 style=\"color: #3498db; font-size: 28px; margin: 0;\">Yudo Scheduler</h1>\n            <p style=\"color: #7f8c8d; font-size: 16px; margin-top: 5px;\">Quick Login Access</p>\n          </div>\n\n          <div style=\"background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);\">\n            <h2 style=\"color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;\">Hello,</h2>\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;\">You requested a quick login link for your Yudo Scheduler account. Click the button below to securely access your account.</p>\n\n            <div style=\"text-align: center; margin: 30px 0;\">\n              <a href=\"".concat(link, "\" style=\"background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;\">Log In Now</a>\n            </div>\n\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;\">This link will expire in <strong>10 minutes</strong> for your security.</p>\n            <p style=\"color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;\"><strong>Security Note:</strong> If you didn't request this login link, please ignore this email or contact support if you have concerns about your account security.</p>\n          </div>\n\n          <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;\">\n            <p style=\"color: #95a5a6; font-size: 14px;\">\u00A9 ").concat(new Date().getFullYear(), " Yudo Scheduler. All rights reserved.</p>\n            <p style=\"color: #95a5a6; font-size: 12px; margin-top: 10px;\">This is an automated message, please do not reply.</p>\n          </div>\n        </div>\n      "),
                    };
                    return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error sending quick login link:', error_3);
                    throw new Error('Failed to send quick login link');
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendQuickLoginLink = sendQuickLoginLink;
function sendTelegramLink(link, receiver) {
    return __awaiter(this, void 0, void 0, function () {
        var mailBody, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mailBody = {
                        EMAIL_PASS: process.env.EMAIL_PASS,
                        EMAIL: process.env.EMAIL,
                        from: process.env.EMAIL || '',
                        to: receiver,
                        subject: 'Yudo Scheduler - Connect to Telegram',
                        text: "Click the following link to connect your Yudo Scheduler account with Telegram: ".concat(link, ". For security, please delete this email after connecting if desired."),
                        html: "\n        <div style=\"font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">\n          <div style=\"text-align: center; margin-bottom: 30px;\">\n            <h1 style=\"color: #3498db; font-size: 28px; margin: 0;\">Yudo Scheduler</h1>\n            <p style=\"color: #7f8c8d; font-size: 16px; margin-top: 5px;\">Telegram Connection</p>\n          </div>\n\n          <div style=\"background-color: #f8f9fa; border-radius: 8px; padding: 30px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);\">\n            <h2 style=\"color: #2c3e50; font-size: 22px; margin-top: 0; margin-bottom: 20px;\">Hello,</h2>\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 25px;\">Click the button below to connect your account with Telegram and receive updates:</p>\n\n            <div style=\"text-align: center; margin: 30px 0;\">\n              <a href=\"".concat(link, "\" style=\"background-color: #0088cc; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s ease;\">\n                <span style=\"vertical-align: middle;\">Connect to Telegram</span>\n                <span style=\"display: inline-block; vertical-align: middle; margin-left: 10px;\">\n                  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"white\">\n                    <path d=\"M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm-2.5 14.5l7.5-3.5-7.5-3.5v2.5l4.5 1-4.5 1v2.5z\"/>\n                  </svg>\n                </span>\n              </a>\n            </div>\n\n            <p style=\"color: #34495e; font-size: 16px; line-height: 1.6; margin-bottom: 5px;\">Connecting to Telegram allows you to receive notifications and updates about your schedule directly through the Telegram messaging app.</p>\n            <p style=\"color: #e74c3c; font-size: 15px; line-height: 1.6; margin-top: 15px;\"><strong>Note:</strong> For security reasons, you may want to delete this email after connecting your account.</p>\n          </div>\n\n          <div style=\"text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;\">\n            <p style=\"color: #95a5a6; font-size: 14px;\">\u00A9 ").concat(new Date().getFullYear(), " Yudo Scheduler. All rights reserved.</p>\n            <p style=\"color: #95a5a6; font-size: 12px; margin-top: 10px;\">This is an automated message, please do not reply.</p>\n          </div>\n        </div>\n      "),
                    };
                    return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_4 = _a.sent();
                    console.error('Error sending Telegram link:', error_4);
                    throw new Error('Failed to send Telegram link');
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.sendTelegramLink = sendTelegramLink;
var scheduleEmail = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, subject_1, body_1, scheduleTime, to_1, user, telegram_1, localDate, jobId_1, email, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, subject_1 = _a.subject, body_1 = _a.body, scheduleTime = _a.scheduleTime;
                to_1 = req.user.email;
                return [4 /*yield*/, user_model_1.User.findByPk(req.user.id)];
            case 1:
                user = _c.sent();
                telegram_1 = (_b = user === null || user === void 0 ? void 0 : user.telegram) !== null && _b !== void 0 ? _b : null;
                console.log('Received scheduleTime:', scheduleTime);
                if (!to_1 || !subject_1 || !body_1 || !scheduleTime) {
                    return [2 /*return*/, res.status(400).json({ error: 'Please provide valid data!' })];
                }
                localDate = moment_timezone_1.default.tz(scheduleTime, 'Asia/Kolkata').toDate();
                if (Number.isNaN(localDate.getTime())) {
                    return [2 /*return*/, res.status(400).json({ error: 'Invalid schedule time provided!' })];
                }
                if (localDate.getTime() <= Date.now()) {
                    return [2 /*return*/, res.status(400).json({ error: 'Schedule time must be in the future!' })];
                }
                console.log('Converted local schedule time:', localDate);
                jobId_1 = (0, crypto_1.randomUUID)();
                node_schedule_1.default.scheduleJob(jobId_1, localDate, function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mailBody, telBody, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 5, , 6]);
                                console.log('Executing scheduled job:', jobId_1);
                                mailBody = {
                                    EMAIL_PASS: process.env.EMAIL_PASS,
                                    EMAIL: process.env.EMAIL,
                                    from: process.env.EMAIL || '',
                                    to: to_1,
                                    subject: subject_1,
                                    text: body_1,
                                    html: "\n            <div style=\"font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;\">\n              <h2 style=\"color: #4A90E2;\">Yudo-Scheduler</h2>\n              <p style=\"font-size: 16px; color: #333;\">You have a scheduled reminder:</p>\n              <p style=\"font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;\">\n                ".concat(body_1, "\n              </p>\n              <p style=\"font-size: 14px; color: #666; margin-top: 10px;\">Stay on track with Yudo-Scheduler.</p>\n              <hr style=\"margin: 20px 0; border: none; border-top: 1px solid #ddd;\">\n              <p style=\"font-size: 12px; color: #999;\">If you did not schedule this reminder, please ignore this email.</p>\n            </div>\n          "),
                                };
                                return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, email_model_1.Email.update({ status: 'sent' }, { where: { jobId: jobId_1 } })];
                            case 2:
                                _a.sent();
                                if (!telegram_1) return [3 /*break*/, 4];
                                telBody = "<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong>: ".concat(subject_1, "\n<strong>Message</strong>: ").concat(body_1);
                                return [4 /*yield*/, axios_1.default.post("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/sendMessage"), {
                                        chat_id: telegram_1,
                                        text: telBody,
                                        parse_mode: 'HTML',
                                    })];
                            case 3:
                                _a.sent();
                                _a.label = 4;
                            case 4:
                                console.log('Job completed successfully:', jobId_1);
                                return [3 /*break*/, 6];
                            case 5:
                                err_1 = _a.sent();
                                console.error('Error in scheduled job:', err_1);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, email_model_1.Email.create({
                        to: to_1,
                        subject: subject_1,
                        body: body_1,
                        scheduleTime: localDate,
                        jobId: jobId_1,
                        status: 'pending',
                    })];
            case 2:
                email = _c.sent();
                return [2 /*return*/, res.json({ message: 'Email scheduled successfully', jobId: jobId_1, email: email })];
            case 3:
                error_5 = _c.sent();
                console.error('Error scheduling email:', error_5);
                return [2 /*return*/, res.status(500).json({ error: 'Failed to schedule email. Please try again.' })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.scheduleEmail = scheduleEmail;
var deleteSchedule = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var jobId, email, job, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                jobId = req.params.jobId;
                return [4 /*yield*/, email_model_1.Email.findOne({ where: { jobId: jobId } })];
            case 1:
                email = _a.sent();
                if (!email) {
                    return [2 /*return*/, res.status(404).send({ error: 'Schedule not found!' })];
                }
                if (email.to !== req.user.email) {
                    return [2 /*return*/, res.status(403).send({ error: 'Not authorized to delete this reminder!' })];
                }
                job = node_schedule_1.default.scheduledJobs[jobId];
                if (job) {
                    job.cancel();
                }
                return [4 /*yield*/, email_model_1.Email.destroy({ where: { jobId: jobId } })];
            case 2:
                _a.sent();
                return [2 /*return*/, res.send({ message: 'Reminder deleted successfully!' })];
            case 3:
                error_6 = _a.sent();
                console.error('Error deleting schedule:', error_6);
                return [2 /*return*/, res.status(500).send({ error: 'An error occurred while deleting the reminder.' })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteSchedule = deleteSchedule;
var getAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, limit, skip, status_1, whereClause, _a, total, emails, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                email = req.user.email;
                limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
                skip = req.query.skip ? parseInt(req.query.skip, 10) : 0;
                status_1 = req.query.status;
                whereClause = { to: email };
                if (status_1 === 'pending' || status_1 === 'sent') {
                    whereClause.status = status_1;
                }
                return [4 /*yield*/, email_model_1.Email.findAndCountAll(__assign({ where: whereClause, order: [['createdAt', 'DESC']], offset: skip }, (limit ? { limit: limit } : {})))];
            case 1:
                _a = _b.sent(), total = _a.count, emails = _a.rows;
                return [2 /*return*/, res.send({
                        total: total,
                        emails: emails,
                    })];
            case 2:
                error_7 = _b.sent();
                console.error('Error fetching reminders:', error_7);
                return [2 /*return*/, res.status(400).send({ error: 'An error occurred while fetching reminders!' })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getAll = getAll;
var getOne = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, email_model_1.Email.findByPk(req.params.id)];
            case 1:
                email = _a.sent();
                if (!email) {
                    return [2 /*return*/, res.status(404).send({ error: 'Reminder not found!' })];
                }
                if (email.to !== req.user.email) {
                    return [2 /*return*/, res.status(403).send({ error: 'Not authorized to access this reminder!' })];
                }
                return [2 /*return*/, res.send(email)];
            case 2:
                error_8 = _a.sent();
                console.error('Error fetching reminder:', error_8);
                return [2 /*return*/, res.status(500).send({ error: 'An error occurred while fetching the reminder.' })];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getOne = getOne;
var updateSchedule = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id_1, _a, subject, body, scheduleTime, email_1, existingJob, nextScheduleTime, nextSubject_1, nextBody_1, jobId, error_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id_1 = req.params.id;
                _a = req.body, subject = _a.subject, body = _a.body, scheduleTime = _a.scheduleTime;
                return [4 /*yield*/, email_model_1.Email.findByPk(id_1)];
            case 1:
                email_1 = _b.sent();
                if (!email_1) {
                    return [2 /*return*/, res.status(404).send({ error: 'Reminder not found!' })];
                }
                if (email_1.to !== req.user.email) {
                    return [2 /*return*/, res.status(403).send({ error: 'Not authorized to update this reminder!' })];
                }
                existingJob = node_schedule_1.default.scheduledJobs[email_1.jobId];
                if (existingJob) {
                    existingJob.cancel();
                }
                nextScheduleTime = scheduleTime
                    ? moment_timezone_1.default.tz(scheduleTime, 'Asia/Kolkata').toDate()
                    : new Date(email_1.scheduleTime);
                if (Number.isNaN(nextScheduleTime.getTime())) {
                    return [2 /*return*/, res.status(400).send({ error: 'Invalid schedule time provided!' })];
                }
                if (nextScheduleTime.getTime() <= Date.now()) {
                    return [2 /*return*/, res.status(400).send({ error: 'Schedule time must be in the future!' })];
                }
                nextSubject_1 = subject || email_1.subject;
                nextBody_1 = body || email_1.body;
                jobId = (0, crypto_1.randomUUID)();
                node_schedule_1.default.scheduleJob(jobId, nextScheduleTime, function () { return __awaiter(void 0, void 0, void 0, function () {
                    var mailBody, user, telBody, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 6, , 7]);
                                mailBody = {
                                    EMAIL_PASS: process.env.EMAIL_PASS,
                                    EMAIL: process.env.EMAIL,
                                    from: process.env.EMAIL || '',
                                    to: email_1.to,
                                    subject: nextSubject_1,
                                    text: nextBody_1,
                                    html: "\n            <div style=\"font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto; background-color: #f9f9f9;\">\n              <h2 style=\"color: #4A90E2;\">Yudo-Scheduler</h2>\n              <p style=\"font-size: 16px; color: #333;\">You have a scheduled reminder:</p>\n              <p style=\"font-size: 18px; font-weight: bold; color: #2D89EF; background: #EAF2FF; padding: 10px; display: inline-block; border-radius: 5px;\">\n                ".concat(nextBody_1, "\n              </p>\n              <p style=\"font-size: 14px; color: #666; margin-top: 10px;\">Stay on track with Yudo-Scheduler.</p>\n              <hr style=\"margin: 20px 0; border: none; border-top: 1px solid #ddd;\">\n              <p style=\"font-size: 12px; color: #999;\">If you did not schedule this reminder, please ignore this email.</p>\n            </div>\n          "),
                                };
                                return [4 /*yield*/, sendMailViaSecondApp(mailBody)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, email_model_1.Email.update({ status: 'sent' }, { where: { id: id_1 } })];
                            case 2:
                                _a.sent();
                                return [4 /*yield*/, user_model_1.User.findOne({ where: { email: email_1.to } })];
                            case 3:
                                user = _a.sent();
                                if (!(user === null || user === void 0 ? void 0 : user.telegram)) return [3 /*break*/, 5];
                                telBody = "<strong>Reminder From Yudo-Scheduler</strong>\n<strong>Subject</strong> : ".concat(nextSubject_1, " \n<strong>Message</strong> : ").concat(nextBody_1);
                                return [4 /*yield*/, axios_1.default.post("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/sendMessage"), {
                                        chat_id: user.telegram,
                                        text: telBody,
                                        parse_mode: 'HTML',
                                    })];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5: return [3 /*break*/, 7];
                            case 6:
                                err_2 = _a.sent();
                                console.error('Error in scheduled job:', err_2);
                                return [3 /*break*/, 7];
                            case 7: return [2 /*return*/];
                        }
                    });
                }); });
                return [4 /*yield*/, email_1.update({
                        subject: nextSubject_1,
                        body: nextBody_1,
                        scheduleTime: nextScheduleTime,
                        jobId: jobId,
                        status: 'pending',
                    })];
            case 2:
                _b.sent();
                return [2 /*return*/, res.send({ message: 'Reminder updated successfully', jobId: jobId })];
            case 3:
                error_9 = _b.sent();
                console.error('Error updating reminder:', error_9);
                return [2 /*return*/, res.status(500).send({ error: 'An error occurred while updating the reminder.' })];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateSchedule = updateSchedule;
