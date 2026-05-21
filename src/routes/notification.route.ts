import { Router } from "express";
import auth from "../middleware/authentication";
import { getNotification } from "../controllers/notification.controller";


const router = Router();

router.get("/getAll",auth,getNotification)
export default router;
