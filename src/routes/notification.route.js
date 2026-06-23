"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var authentication_1 = require("../middleware/authentication");
var notification_controller_1 = require("../controllers/notification.controller");
var router = (0, express_1.Router)();
router.get("/getAll", authentication_1.default, notification_controller_1.getNotification);
exports.default = router;
