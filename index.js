// import express from "express";
import express from "express"
import config from "./DB/config.js"
import dotenv from "dotenv"
import userRouter from './routes/user.route.js'
import emailRouter from "./routes/email.route.js"
import cors from "cors"
const app = express();
dotenv.config()

app.use(express.json())
app.use(cors())

// console.log(process.env.EMAIL)
app.get("/",(req,res)=>{
    res.send({response:"hello world!"})
})
app.use("/api/v1/user",userRouter)
app.use("/api/v1/email",emailRouter)



app.listen(5000,()=>{
    console.log("your app is running on port 5000");
    config()
})