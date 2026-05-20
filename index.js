// import express from "express";
import express from "express"
import config from "./DB/config.js"
import dotenv from "dotenv"
import userRouter from './routes/user.route.js'
import emailRouter from "./routes/email.route.js"
import taskRoute from "./routes/task.route.js"
import notificationRoute from "./routes/notification.route.js"
// import {sendMessage} from "./contollers/telegram.controller.js"
import { pollUpdates } from "./contollers/telegram.controller.js"

import cors from "cors"


// sendMessage()

const app = express();
dotenv.config()

app.use(express.json())
app.use(cors())


app.get("/",(req,res)=>{
    res.send({response:"hello world!"})
})
app.use("/api/v1/user",userRouter)
app.use("/api/v1/email",emailRouter)
app.use("/api/v1/task",taskRoute)
app.use("/api/v1/notification",notificationRoute)



app.listen(5000,()=>{
    console.log("your app is running on port 5000");
    config()
    setInterval(pollUpdates,12000);
})