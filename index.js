// import express from "express";
import express from "express"
import config from "./DB/config.js"
import dotenv from "dotenv"
import userRouter from './routes/user.route.js'
import emailRouter from "./routes/email.route.js"

import cors from "cors"
const app = express();
dotenv.config()
// sk-20529d6502f445ef840cd5c623a8a9d3
// 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
app.use(express.json())
app.use(cors())


app.get("/",(req,res)=>{
    res.send({response:"hello world!"})
})
app.use("/api/v1/user",userRouter)
app.use("/api/v1/email",emailRouter)



app.listen(5000,()=>{
    console.log("your app is running on port 5000");
    config()
})