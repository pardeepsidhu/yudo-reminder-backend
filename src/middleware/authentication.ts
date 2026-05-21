import {User} from '../models/user.model'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { NextFunction, Request, Response } from 'express'
dotenv.config()
const auth = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        let token = req.header("auth-token");
  
        if(!token) return res.status(404).send({error:'please provide a vlaid json token !'});
        let userId = jwt.verify(token,process.env.JWT_SECRET as string);
        (req as any).user = userId;
        next();
    } catch (error) {
        res.status(400).send({error:"some internal error accured while authentication"})
    }
}

export default auth;
