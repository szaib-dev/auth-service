import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import {
    generateAccessToken,
    generateRefreshToken,
} from '../services/TokenCreation.js';
import hashMatchPass from '../services/HashMatchPass.js';
import type { authInterface } from '../types/index.js';

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

        generateAccessToken(payload, res);
        await generateRefreshToken(
            {
                ...payload,
                id: user.id,
            },
            res
        );

        return res.status(201).json({
            message: 'Successfully new user created!',
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (
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

        const { email, password } = req.body;

        // user check
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            next(Error('Email or Password not valid'));
            return;
        }

        // match password
        const passwordCheck = await hashMatchPass(password, user.password);

        if (!passwordCheck) {
            next(Error('Email or Password not Valid'));
            return;
        }

        // check refresh token exist

        await prisma.refreshToken.deleteMany({
            where: {
                userId: user.id,
            },
        });
        // create payload
        const payload = {
            sub: user.id,
        };

        // generate and store tokens
        generateAccessToken(payload, res);
        await generateRefreshToken(
            {
                ...payload,
                id: user.id,
            },
            res
        );

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(new Error(error as string));
        return;
    }
};

export const VerifyMyself = async (
    request: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const req = request as authInterface;
        if (!req.auth.sub) {
            return res.status(403).json('No user found');
        }
        return res.status(200).json({ id: req.auth.sub });
    } catch (error) {
        next(new Error(error as string));
        return;
    }
};

export const refreshTokens = async(request: Request, res: Response, next:NextFunction)=>{

    try {
       
        const req = request as authInterface;
        const token = await prisma.refreshToken.findUnique({
            where: {
                id: req.auth.id!
            }
        })

        if(!token){
            next(Error('Token is not found in db;'));
            return;
        }
        let user;

        if(token.userId === req.auth.sub){
             user = await prisma.user.findUnique({
                where: {
                    id: token.userId
                }
             })
        }else {
              next(Error('Token is not valid for this user;'));
            return;
        }

        if(!user){
             next(Error('User not found with this token '));
            return res.status(404).json({message: "user not found with this token"});
        }

        const payload = {
            sub: user.id
        }

        //delete existing token
        await prisma.refreshToken.delete({
            where: {
                id: token.id
             }
        })


        generateAccessToken(payload, res);
        await generateRefreshToken({...payload, id: user.id}, res)

        res.status(200).json({userId: user.id, success:true})
    } catch (error) {
        next(error);
        return;
    }

}
