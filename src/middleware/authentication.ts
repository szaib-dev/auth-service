import { expressjwt } from 'express-jwt';
import type { GetVerificationKey } from 'express-jwt';
import jwksClient from 'jwks-rsa';
import config from '../config/index.js';
import type { Request, Response, NextFunction } from 'express';

const JWKS_URI = config.JWKS_URI;

if (!JWKS_URI) {
    throw new Error('JWKS URI is missing');
}

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksUri: JWKS_URI,
    }) as GetVerificationKey,

    algorithms: ['RS256'],

    getToken: (req: Request) => {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : undefined;

        if (
            bearerToken &&
            bearerToken !== 'undefined' &&
            bearerToken !== 'null'
        ) {
            return bearerToken;
        }

        const { accessToken } = req.cookies;

        if (accessToken) {
            return accessToken;
        }

        return undefined;
    },
}) as (req: Request, res: Response, next: NextFunction) => void;
