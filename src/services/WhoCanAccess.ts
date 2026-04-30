import type { NextFunction, Request, Response } from "express"
import type { authInterface } from "../types/index.js"
import createHttpError from "http-errors";

const WhoCanAccess  = (roles: string[])=>{
    return (request: Request, res: Response, next: NextFunction)=>{
       const req = request as authInterface;

       if(roles.includes(req.auth.role)){
        next()
       }else {
        next(createHttpError(403, "This role don't have permission for this."))
       }
    }
}

export default WhoCanAccess