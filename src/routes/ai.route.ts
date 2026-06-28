import { Router } from "express";

import autherntication from "../middleware/authentication";
import {chat}  from "../controllers/Ai.controller"

const router = Router();

router.get("/", (req, res) => {
  res.send("hello world from AI route");
});


router.post("/chat", autherntication, chat);

export default router;