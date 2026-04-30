import { expressjwt } from 'express-jwt';
import config from '../config/index.js';
import type { NextFunction, Request, Response } from 'express';
import prisma from '../config/db.js';

export default expressjwt({
    secret: config.REFRESH_TOKEN_SECRET as string,
    algorithms: ['HS256'],
    getToken: (req: Request) => {
        const { refreshToken } = req.cookies;
        return refreshToken;
    },
    async isRevoked(req: Request, token) {
        const refreshTokenRecord = await prisma.refreshToken.findFirst({
            where: {
                id: (token?.payload as { id: string }).id,
            },
        });

        return refreshTokenRecord === null;
    },
}) as (req: Request, res: Response, next: NextFunction) => void;
