import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken"
import path from "path"
import fs from "fs"
import config from "../config/index.js";
import prisma from "../config/db.js";

export const generateAccessToken = (payload: JwtPayload)=>{
     // locating private key path
        const privateKeyPath = path.join(
            process.cwd(),
            'certs',
            'privateKey.pem'
        );

        // getting private key from path
        const privateKey = fs.readFileSync(privateKeyPath);
        if (!privateKey) {
           throw new Error("Private Key is For Token Creation")
        }

        // generating acces token with private key and payload
        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            issuer: 'auth-service',
            expiresIn: '1h',
        });

        return accessToken
}


export const generateRefreshToken = async (payload: JwtPayload)=>{
     // Getting Token Secret for Refresh token
        const refreshTokenSecret = config.REFRESH_TOKEN_SECRET;

        if(!refreshTokenSecret){
         throw new Error("refresh token secret is missing")
        }
      // create refresh token details in db
        await prisma.refreshToken.create({
            data: {
                userId: payload.id,
            }
        })

        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            algorithm: 'HS256',
            issuer: 'auth-service',
            expiresIn: '1y',
        });

        return refreshToken
}

