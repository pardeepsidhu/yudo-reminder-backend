"use strict";
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
exports.quickLogin = exports.quickLoginLink = exports.resetPassword = exports.resetPasswordLink = exports.updateProfile = exports.getProfile = exports.login = exports.verifyOtp = exports.sendOtp = void 0;
var dotenv_1 = require("dotenv");
var user_model_1 = require("../models/user.model");
var email_controller_1 = require("./email.controller");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var notification_controller_1 = require("./notification.controller");
dotenv_1.default.config();
var sendOtp = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, password, email, user, otp, hashedPass, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, password = _a.password, email = _a.email;
                if (!email || !password) {
                    return [2 /*return*/, res
                            .status(400)
                            .send({ error: "Please fill all fields with valid info." })];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 1:
                user = _b.sent();
                // If user exists and OTP already verified
                if (user && user.otp === "verified") {
                    return [2 /*return*/, res
                            .status(400)
                            .send({ error: "User already exists. Please log in!" })];
                }
                otp = Math.floor(1000 + Math.random() * 9000).toString();
                return [4 /*yield*/, bcryptjs_1.default.hash(password, 8)];
            case 2:
                hashedPass = _b.sent();
                if (!!user) return [3 /*break*/, 4];
                return [4 /*yield*/, user_model_1.User.create({
                        email: email,
                        otp: otp,
                        password: hashedPass,
                        telegram: "",
                    })];
            case 3:
                // Create new user
                user = _b.sent();
                return [3 /*break*/, 6];
            case 4: 
            // Update existing user
            return [4 /*yield*/, user_model_1.User.update({
                    otp: otp,
                    password: hashedPass,
                }, {
                    where: { email: email },
                })];
            case 5:
                // Update existing user
                _b.sent();
                _b.label = 6;
            case 6: 
            // Send OTP email
            return [4 /*yield*/, (0, email_controller_1.sendOtpFun)(otp, email)];
            case 7:
                // Send OTP email
                _b.sent();
                return [2 /*return*/, res
                        .status(200)
                        .send({ message: "OTP sent successfully!", otp: otp })];
            case 8:
                error_1 = _b.sent();
                console.error(error_1);
                return [2 /*return*/, res.status(500).send({
                        error: "An error occurred while creating the user!",
                    })];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.sendOtp = sendOtp;
var verifyOtp = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, otp, email, user, link, token, notificationData, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, otp = _a.otp, email = _a.email;
                if (!otp || !email) {
                    return [2 /*return*/, res.send({ error: "Please enter valid data" })];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).send({
                            error: "User not found!",
                        })];
                }
                if (user.otp == "verified") {
                    return [2 /*return*/, res.status(404).send({
                            error: "User Already Exist Please Login !",
                        })];
                }
                if (user.otp != otp) {
                    return [2 /*return*/, res.send({
                            error: "Please enter valid otp",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.update({
                        otp: "verified",
                    }, {
                        where: { email: email },
                    })];
            case 2:
                _b.sent();
                link = "https://t.me/".concat(process.env.BOT_USERNAME, "?start=").concat(encodeURIComponent(user.id));
                return [4 /*yield*/, (0, email_controller_1.sendTelegramLink)(link, email)];
            case 3:
                _b.sent();
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 4:
                user = _b.sent();
                user = user.toJSON();
                delete user.password;
                token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET);
                notificationData = {
                    title: "Telegram email sent",
                    type: "telegram",
                    description: "You have successfuly recieved telegram conection link , Please check your email inbox ,  Stay updated a keep connected with yudo-scheduler",
                    user: user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 5:
                _b.sent();
                return [2 /*return*/, res.send({ token: token })];
            case 6:
                error_2 = _b.sent();
                console.error(error_2);
                return [2 /*return*/, res.status(500).send({
                        error: "Some error occurred while verifying OTP.",
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.verifyOtp = verifyOtp;
var login = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, compairPassword, notificationData, token, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email) {
                    return [2 /*return*/, res.status(404).send({
                            error: "user not found !",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).send({
                            error: "user not found !",
                        })];
                }
                if (user.otp != "verified") {
                    return [2 /*return*/, res.status(400).send({
                            error: "user not verified !",
                        })];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
            case 2:
                compairPassword = _b.sent();
                if (!compairPassword) {
                    return [2 /*return*/, res.status(404).send({
                            error: "email or password is wrong !",
                        })];
                }
                user = user.toJSON();
                notificationData = {
                    title: "Logged in successfuly",
                    type: "yudo",
                    description: "Welcome back , You have successfuly logged in with yudo-scheduler ,  Stay updated a keep connected with yudo-scheduler",
                    user: user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 3:
                _b.sent();
                delete user.password;
                token = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET);
                return [2 /*return*/, res.send({ token: token })];
            case 4:
                error_3 = _b.sent();
                console.log(error_3);
                return [2 /*return*/, res.status(400).send({
                        error: "some internal error accured !",
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
var getProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.user.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).send({
                            error: "unauthorized user !",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).send({
                            error: "unauthorized user !",
                        })];
                }
                user = user.toJSON();
                delete user.password;
                res.send(user);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.log(error_4);
                res.status(400).send({
                    error: "some error accured while fetching user !",
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getProfile = getProfile;
var updateProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, name_1, profile, user, updateFields, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = req.user.id;
                _a = req.body, name_1 = _a.name, profile = _a.profile;
                if (!userId) {
                    return [2 /*return*/, res.status(401).send({
                            error: "unauthorized user!",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).send({
                            error: "unauthorized user!",
                        })];
                }
                updateFields = {};
                if (name_1 !== undefined) {
                    updateFields.name = name_1;
                }
                if (profile !== undefined) {
                    updateFields.profile = profile;
                }
                if (!(Object.keys(updateFields).length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, user_model_1.User.update(updateFields, {
                        where: { id: userId },
                    })];
            case 2:
                _b.sent();
                res.send({
                    message: "profile updated",
                });
                return [3 /*break*/, 4];
            case 3:
                res.send({
                    message: "no fields to update",
                });
                _b.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_5 = _b.sent();
                console.log(error_5);
                res.status(400).send({
                    error: "some error occurred while updating user!",
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateProfile = updateProfile;
var resetPasswordLink = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, resetId, token, resetLink, notificationData, error_6;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                email = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || ((_b = req.query) === null || _b === void 0 ? void 0 : _b.email);
                if (!email) {
                    return [2 /*return*/, res.status(401).send({
                            error: "Unauthorized user!",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 1:
                user = _c.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).send({
                            error: "Unauthorized user!",
                        })];
                }
                resetId = user.id;
                token = jsonwebtoken_1.default.sign({
                    resetId: resetId,
                }, process.env.JWT_SECRET, {
                    expiresIn: "10m",
                });
                resetLink = "https://yudo-scheduler.vercel.app/login/?resetId=".concat(token);
                return [4 /*yield*/, (0, email_controller_1.sendResetPasswordLink)(resetLink, user.email)];
            case 2:
                _c.sent();
                notificationData = {
                    title: "Change password email sent",
                    type: "auth",
                    description: "You have successfuly recieved reset password link , Please check your email inbox and insure it will expire in 10 minutes  ,  Stay updated a keep connected with yudo-scheduler",
                    user: user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 3:
                _c.sent();
                res.status(200).send({
                    message: "Password reset link generated successfully",
                });
                return [3 /*break*/, 5];
            case 4:
                error_6 = _c.sent();
                console.log(error_6);
                res.status(400).send({
                    error: "Some error occurred while generating password reset link!",
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.resetPasswordLink = resetPasswordLink;
var resetPassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, newPassword, data, userId, user, hashedPassword, notificationData, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                token = req.query.resetId;
                newPassword = req.body.password;
                data = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                userId = data.resetId;
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            error: "User not found.",
                        })];
                }
                return [4 /*yield*/, bcryptjs_1.default.hash(newPassword, 8)];
            case 2:
                hashedPassword = _a.sent();
                user.password = hashedPassword;
                return [4 /*yield*/, user.save()];
            case 3:
                _a.sent();
                notificationData = {
                    title: "Change password email sent",
                    type: "auth",
                    description: "Your password has been reset successfuly ,  Stay updated a keep connected with yudo-scheduler",
                    user: user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 4:
                _a.sent();
                res.status(200).json({
                    message: "Password has been successfully reset.",
                });
                return [3 /*break*/, 6];
            case 5:
                error_7 = _a.sent();
                console.error(error_7);
                if (error_7.name === "TokenExpiredError") {
                    return [2 /*return*/, res.status(400).json({
                            error: "Reset link has expired.",
                        })];
                }
                res.status(400).json({
                    error: "Some error occurred while resetting password!",
                });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.resetPassword = resetPassword;
var quickLoginLink = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, token, quickLoginLink_1, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                email = req.body.email;
                if (!email) {
                    return [2 /*return*/, res.status(401).send({
                            error: "Unauthorized user!",
                        })];
                }
                return [4 /*yield*/, user_model_1.User.findOne({
                        where: { email: email },
                    })];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).send({
                            error: "Unauthorized user!",
                        })];
                }
                token = jsonwebtoken_1.default.sign({
                    userId: user.id,
                }, process.env.JWT_SECRET, {
                    expiresIn: "10m",
                });
                quickLoginLink_1 = "https://yudo-scheduler.vercel.app/quick-login?token=".concat(token);
                return [4 /*yield*/, (0, email_controller_1.sendQuickLoginLink)(quickLoginLink_1, user.email)];
            case 2:
                _a.sent();
                res.status(200).send({
                    message: "Quick login link generated successfully!",
                });
                return [3 /*break*/, 4];
            case 3:
                error_8 = _a.sent();
                console.error("Error generating quick login link:", error_8);
                res.status(400).send({
                    error: "Some error occurred while generating quick login link!",
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.quickLoginLink = quickLoginLink;
var quickLogin = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, data, userId, user, loginToken, notificationData, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                token = req.query.token;
                if (!token) {
                    return [2 /*return*/, res.status(400).json({
                            error: "Token is required.",
                        })];
                }
                data = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                userId = data.userId;
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({
                            error: "User not found.",
                        })];
                }
                user = user.toJSON();
                delete user.password;
                loginToken = jsonwebtoken_1.default.sign(user, process.env.JWT_SECRET);
                notificationData = {
                    title: "Logged in successfuly",
                    type: "yudo",
                    description: "Welcome back , You have successfuly logged in with yudo-scheduler using quick login link ,  Stay updated a keep connected with yudo-scheduler",
                    user: user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 2:
                _a.sent();
                res.status(200).json({
                    token: loginToken,
                });
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error("Quick login error:", error_9);
                if (error_9.name === "TokenExpiredError") {
                    return [2 /*return*/, res.status(400).json({
                            error: "Login link has expired.",
                        })];
                }
                res.status(400).json({
                    error: "Some error occurred while logging in!",
                });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.quickLogin = quickLogin;
