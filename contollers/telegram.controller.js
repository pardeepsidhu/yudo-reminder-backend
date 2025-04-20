let lastUpdateId = 0;
import User from "../models/user.model.js"
import dotenv from "dotenv"
import axios from "axios";
import { sendTelegramLink } from "./email.contoller.js";
dotenv.config("../.env")

const pollUpdates = async () => {
    try {
        const { data } = await axios.get(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates`, {
            params: { offset: lastUpdateId + 1 }
        });

        for (const update of data.result) {
            if (!update.message) continue;

            const chatId = update.message.chat.id;
            const text = update.message.text?.trim();
            // console.log(chatId+" "+text)
            // ❌ Ignore messages that are NOT "/start <email>"
            if (!text.startsWith("/start")) continue;
            // console.log(chatId+" "+text+" fff")
            const _id = text.replace("/start", "").trim();
            if (!_id) continue; 
            await User.updateOne({_id},{$set:{telegram:chatId}})
            // users[email] = chatId; // ✅ Store user

            console.log(`✅ Registered: ${_id} -> ${chatId}`);

            // ✅ Send confirmation message
            await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
                chat_id: chatId,
                text: "✅ You are successfuly registered ! with YUDO REMIDER . now you will revieve you all schedules through telegram as well ...",
            });

            lastUpdateId = update.update_id;
        }
    } catch (error) {
        console.log(error)
        console.error("❌ Polling Error:", error.message);
    }
};


const telegramUpadate=async(req,res)=>{
    try {
        let email = req.user.email;
        const link = `https://t.me/${process.env.BOT_USERNAME}?start=${encodeURIComponent(req.user._id)}`;
        await sendTelegramLink(link,email);
        res.send({message:"telegram link send successfuly !"})
    } catch (error) {
        console.log(error)
        res.status(400).send({error:"some error accured while sending telgram link !"})
    }
}

export {pollUpdates,telegramUpadate}
