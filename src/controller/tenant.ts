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

export const tenantsList = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const list = await prisma.resturants.findMany({});

        if (!list) {
            next(createHttpError(404, 'There is no list found under tenants'));
        }

        res.status(200).json({ list });
    } catch (error) {
        next(error);
        return;
    }
};


export const updateTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { tenantId } = req.params as { tenantId: string }
        const {name, address} = req.body

        if(!name && !address){
            next(createHttpError(400, 'Nothing to update'))
            return;
        }

        if(!tenantId){
            next(createHttpError(400, 'Tenant Id is missing'))
            return;
        }

        const tenant = await prisma.resturants.findUnique({
            where: {
                id: tenantId
            }
        })

        if(!tenant){
            next(createHttpError(402, 'There is no tenant found with this id'))
            return;
        }

        // update tenant

        const updatedTenant = await prisma.resturants.update({
            where: {id: tenantId},
            data: {
                name, 
                address
            }
        })

        res.status(200).json({ tenant: updatedTenant });
    } catch (error) {
        next(error);
        return;
    }
};
export const deleteTenant = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { tenantId } = req.params as { tenantId: string }

        if(!tenantId){
            next(createHttpError(400, 'Tenant Id is missing'))
            return;
        }

        const tenant = await prisma.resturants.findUnique({
            where: {
                id: tenantId
            }
        })

        if(!tenant){
            next(createHttpError(402, 'There is no tenant found with this id'))
            return;
        }

        // delete tenant

        await prisma.resturants.delete({  where: {id: tenantId},        })

        res.status(200).json({ tenant: tenant.id , success: true});
    } catch (error) {
        next(error);
        return;
    }
};

