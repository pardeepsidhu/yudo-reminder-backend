import { Router } from "express";
import auth from "../middleware/authentication.js";
import { getNotification } from "../contollers/notification.controller.js";


const router = Router();

router.get("/getAll",auth,getNotification)
export default router;
