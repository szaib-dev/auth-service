import { expressjwt } from 'express-jwt';
import type { GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import config from '../config/index.js';
import type { Request, Response, NextFunction } from 'express';

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        cache: true,
        jwksUri: config.JWKS_URI!,
    }) as GetVerificationKey,
    algorithms: ['RS256'],
    getToken: (req: Request) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            return token;
        }

        const { accessToken } = req.cookies;

        if (accessToken) {
            return accessToken;
        }

        return undefined;
    },
}) as (req: Request, res: Response, next: NextFunction) => void;
