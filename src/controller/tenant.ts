import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';
import createHttpError from 'http-errors';

export const createTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { name, address } = req.body;
        if (!name || !address) {
            next(Error('Name or Addres inputs are missing'));
            return;
        }

        const tenant = await prisma.resturants.create({
            data: {
                name,
                address,
            },
        });

        return res.status(201).json({ success: true, tenantId: tenant.id });
    } catch (error) {
        next(error);
        return;
    }
};



export const tenantsList = async(req:Request, res:Response, next: NextFunction)=>{
    try {
        const list = await prisma.resturants.findMany({});

        if(!list){
            next(createHttpError(404, 'There is no list found under tenants'))
        }

        res.status(200).json({list})
    } catch (error) {
        next(error)
        return
    }
}