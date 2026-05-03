import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import prisma from '../config/db.js';
import bcrypt from 'bcryptjs';
import { UserRole } from '../generated/prisma/enums.js';

export const createMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fullname, email, password } = req.body;

        if (!fullname || !email || !password) {
            next(createHttpError(400, 'it looks some fields are missing'));
            return;
        }

        const hashedpassword = await bcrypt.hash(password, 12);

        const member = await prisma.user.create({
            data: {
                fullname,
                email,
                password: hashedpassword,
                role: UserRole.MANAGER,
            },

            select: {
                email: true,
                fullname: true,
                id: true,
                role: true,
            },
        });

        return res.status(201).json({
            member,
        });
    } catch (error) {
        next(error);
        return;
    }
};

export const getMemberById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { memberId } = req.params;

        const member = await prisma.user.findUnique({
            where: {
                id: memberId as string,
            },
            select: {
                email: true,
                role: true,
                fullname: true,
                id: true,
                tenantId: true,
            },
        });

        if (!member) {
            next(createHttpError(400, 'there is no member found with this id'));
            return;
        }

        return res.status(201).json({
            member,
        });
    } catch (error) {
        next(error);
        return;
    }
};

export const deleteMemberById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { memberId } = req.params;

        const member = await prisma.user.findFirst({
            where: {
                id: memberId as string,
            },
            select: {
                email: true,
                role: true,
                fullname: true,
                id: true,
                tenantId: true,
            },
        });

        if (!member) {
            next(createHttpError(400, 'there is no member found with this id'));
            return;
        }

        await prisma.user.delete({
            where: {
                id: member.id,
            },
        });

        return res.status(201).json({
            success: true,
        });
    } catch (error) {
        next(error);
        return;
    }
};

export const updateMemberById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { memberId } = req.params;
        const { fullname, role } = req.body;

        if (!fullname && !role) {
            next(createHttpError(400, 'Please provide data to update member'));
            return;
        }

        const member = await prisma.user.findFirst({
            where: {
                id: memberId as string,
            },
            select: {
                email: true,
                role: true,
                fullname: true,
                id: true,
                tenantId: true,
            },
        });

        if (!member) {
            next(createHttpError(400, 'there is no member found with this id'));
            return;
        }

        const updatedMember = await prisma.user.update({
            where: {
                id: memberId as string,
            },
            data: {
                fullname,
                role,
            },
            select: {
                email: true,
                fullname: true,
                role: true,
                id: true,
            },
        });

        return res.status(201).json({
            success: true,
            member: updatedMember,
        });
    } catch (error) {
        next(error);
        return;
    }
};
export const listOfMembers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const members = await prisma.user.findMany({
            select: { email: true, fullname: true, role: true, id: true },
        });

        if (members.length === 0) {
            next(createHttpError(400, 'there is no member found with this id'));
            return;
        }

        return res.status(201).json({
            success: true,
            list: members,
        });
    } catch (error) {
        next(error);
        return;
    }
};
