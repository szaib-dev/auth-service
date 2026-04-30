import {expressjwt} from "express-jwt";
import Config from "../config/index.js";
import type { NextFunction, Request, Response } from "express";


export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET!,
    algorithms: ['HS256'],
    getToken: (req: Request)=>{
        const {refreshToken} = req.cookies;
        return refreshToken
    }
}) as (req: Request, res: Response, next: NextFunction) => void