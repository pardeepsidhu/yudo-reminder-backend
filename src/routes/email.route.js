"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var email_controller_1 = require("../controllers/email.controller");
var authentication_1 = require("../middleware/authentication");
var Ai_controller_1 = require("../controllers/Ai.controller");
var router = (0, express_1.Router)();
router.get("/", authentication_1.default, function (req, res) {
    res.send("hello world from email route");
});
// Schedule routes
router.post("/schedule", authentication_1.default, email_controller_1.scheduleEmail);
router.put("/update/:id", authentication_1.default, email_controller_1.updateSchedule);
router.delete("/delete/:jobId", authentication_1.default, email_controller_1.deleteSchedule);
// Get routes
router.get("/getall", authentication_1.default, email_controller_1.getAll);
router.get("/getone/:id", authentication_1.default, email_controller_1.getOne);
// AI generation route
router.post("/generate", Ai_controller_1.generete);
exports.default = router;
