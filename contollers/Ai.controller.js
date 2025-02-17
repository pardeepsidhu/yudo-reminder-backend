import dotenv from "dotenv"
dotenv.config("../.env")
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const generete = async(req,res)=>{

    try {
        const {prompt} = req.body;
        if(!prompt) res.send({error:"Please Provide Required Prompt !"})
        const prompt2 = prompt+" write an email for me in very very short give me in format of json {subject,message} never write any thing else give me always as format defined write nothing else reather than json object if time not defined consider as today";
        const result = await model.generateContent(prompt2);
        const response = result.response.text().replace('```json','').replace('```','')
        res.send(response)
    } catch (error) {
        res.status(400).send({error:"Some Error Accured While Generating Email !"})
    }
}

export {generete}