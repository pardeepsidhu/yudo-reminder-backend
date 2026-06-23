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
exports.telegramUpadate = exports.pollUpdates = void 0;
var lastUpdateId = 0;
var user_model_1 = require("../models/user.model");
var dotenv_1 = require("dotenv");
var axios_1 = require("axios");
var email_controller_1 = require("./email.controller");
var notification_controller_1 = require("./notification.controller");
dotenv_1.default.config();
var pollUpdates = function () { return __awaiter(void 0, void 0, void 0, function () {
    var data, _i, _a, update, chatId, text, id, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 7, , 8]);
                return [4 /*yield*/, axios_1.default.get("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/getUpdates"), {
                        params: { offset: lastUpdateId + 1 },
                    })];
            case 1:
                data = (_c.sent()).data;
                _i = 0, _a = data.result;
                _c.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                update = _a[_i];
                if (!update.message)
                    return [3 /*break*/, 5];
                chatId = update.message.chat.id;
                text = (_b = update.message.text) === null || _b === void 0 ? void 0 : _b.trim();
                if (!text.startsWith("/start"))
                    return [3 /*break*/, 5];
                id = text.replace("/start", "").trim();
                if (!id)
                    return [3 /*break*/, 5];
                return [4 /*yield*/, user_model_1.User.update({ telegram: chatId }, { where: { id: id } })];
            case 3:
                _c.sent();
                return [4 /*yield*/, axios_1.default.post("https://api.telegram.org/bot".concat(process.env.BOT_TOKEN, "/sendMessage"), {
                        chat_id: chatId,
                        text: "✅ You are successfuly registered ! with YUDO-Scheduler . now you will revieve you all schedules through telegram as well ...",
                    })];
            case 4:
                _c.sent();
                lastUpdateId = update.update_id;
                _c.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_1 = _c.sent();
                console.error("❌ Polling Error:");
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.pollUpdates = pollUpdates;
var telegramUpadate = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var email, link, notificationData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                email = req.user.email;
                link = "https://t.me/".concat(process.env.BOT_USERNAME, "?start=").concat(encodeURIComponent(req.user.id));
                return [4 /*yield*/, (0, email_controller_1.sendTelegramLink)(link, email)];
            case 1:
                _a.sent();
                notificationData = {
                    title: "Telegram email sent",
                    type: "telegram",
                    description: "You have successfuly recieved telegram conection link , Please check your email inbox ,  Stay updated a keep connected with yudo-scheduler",
                    user: req.user.id,
                };
                return [4 /*yield*/, (0, notification_controller_1.createNotification)(notificationData)];
            case 2:
                _a.sent();
                res.send({ message: "telegram link send successfuly !" });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                res.status(400).send({ error: "some error accured while sending telgram link !" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.telegramUpadate = telegramUpadate;
