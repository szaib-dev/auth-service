import type { NextFunction, Request, Response } from "express";
import prisma from "../config/db.js";


export const createTenant = async(req: Request, res: Response, next: NextFunction)=>{
    try {

        const {name, address} = req.body;
        if(!name || !address){
            next(Error('Name or Addres inputs are missing'));
            return;
        }

        const tenant = await prisma.resturants.create({
            data: {
                name,
                address
            }
        })
        
       
        return res.status(201).json({success: true, tenantId: tenant.id})
    } catch (error) {
        next(error)
        return
    }
}