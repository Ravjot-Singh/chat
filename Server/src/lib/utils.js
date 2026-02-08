import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export const generateToken = (userId, res)=>{

    const {JWT_SECRET , NODE_ENV} = ENV;

    if(!JWT_SECRET){
        throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign({userId:userId} , JWT_SECRET , {
        expiresIn: "7D"
    });

    res.cookie("jwt", token , {
        maxAge: 7*24*60*1000,
        httpOnly: true,
        sameSite: "strict",
        secure: NODE_ENV === "development" ? false : true,
    })

    return token;

}