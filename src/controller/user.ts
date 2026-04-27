import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { generateAccessToken, generateRefreshToken } from '../services/TokenCreation.js';

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


        const accessToken = generateAccessToken(payload);
        const refreshToken = await generateRefreshToken({...payload, id: user.id})     
        
        console.log(refreshToken)

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
