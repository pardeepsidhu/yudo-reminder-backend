import dotenv from "dotenv"
import { Request, Response } from "express";
dotenv.config()



const generete = async(req:Request,res:Response)=>{

    try {
        const {prompt} = req.body;

        res.send({success:true})
    } catch (error) {
        res.status(400).send({error:"Some Error Accured While Generating Email !"})
    }
}

export {generete}