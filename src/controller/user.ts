import fs from 'fs';
import path from 'path';

import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Config from '../config/index.js';

export const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // validation check
        const validation = validationResult(req);
        if (!validation.isEmpty()) {
            return res.status(422).json({
                status: 'validation error',
                error: validation.array(),
            });
        }
        // getting data from request
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(402).json({
                message: 'Please add all fields!',
            });
        }

        // hashing the password
        const hashedpassword = await bcrypt.hash(password, 10);

        // storing user into database
        const user = await prisma.user.create({
            data: {
                email,
                fullname,
                password: hashedpassword,
            },
            select: {
                email: true,
                fullname: true,
                id: true,
            },
        });
        // defining payload.
        const payload = {
            sub: user.id,
        };

        // locating private key path
        const privateKeyPath = path.join(
            process.cwd(),
            'certs',
            'privateKey.pem'
        );

        // getting private key from path
        const privateKey = fs.readFileSync(privateKeyPath);
        if (!privateKey) {
            next(Error('Private Key Not exist'));
        }

        // generating acces token with private key and payload
        const accessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            issuer: 'auth-service',
            expiresIn: '1h',
        });

        // Getting Token Secret for Refresh token
        const refreshTokenSecret = Config.REFRESH_TOKEN_SECRET;

        if(!refreshTokenSecret){
            next(Error("refresh token secret is missing"))
            return 
        }

        // I am using same payload but you can change if you want!
        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            algorithm: 'HS256',
            issuer: 'auth-service',
            expiresIn: '1y',
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60,
            domain: 'localhost',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 365,
            domain: 'localhost',
        });

        return res.status(201).json({
            message: 'Successfully new user created!',
            user,
        });

    } catch (error) {
        next(error);
    }
};
