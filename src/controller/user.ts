import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            return res.status(402).json({
                message: 'Please add all fields!',
            });
        }

        const hashedpassword = await bcrypt.hash(password,10)

        const user = await prisma.user.create({
            data: {
                email,
                fullname,
                password: hashedpassword
            },
            select: {
                email: true,
                fullname: true
            }
        })

        return res.status(201).json({
            message: 'Successfully new user created!',
            user
        });
    } catch (error) {
        next(error);
    }
};
