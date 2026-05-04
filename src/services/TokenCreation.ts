import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import config from '../config/index.js';
import prisma from '../config/db.js';
import type { Response } from 'express';

export const generateAccessToken = (payload: JwtPayload, res: Response) => {

    // getting private key from path
    const privateKey = config.PRIVATE_KEY_SECRET;
    if (!privateKey) {
        throw new Error('Private Key is missing');
    }

    // generating acces token with private key and payload
    const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        issuer: 'auth-service',
        expiresIn: '1h',
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
        domain: 'localhost',
    });
};

export const generateRefreshToken = async (
    payload: JwtPayload,
    res: Response
) => {
    // Getting Token Secret for Refresh token
    const refreshTokenSecret = config.REFRESH_TOKEN_SECRET;

    if (!refreshTokenSecret) {
        throw new Error('refresh token secret is missing');
    }
    // create refresh token details in db
    const token = await prisma.refreshToken.create({
        data: {
            userId: payload.id,
        },
    });

    const newPayload = {
        sub: payload.sub,
        id: token.id,
    };

    const refreshToken = jwt.sign(newPayload, refreshTokenSecret, {
        algorithm: 'HS256',
        issuer: 'auth-service',
        expiresIn: '1y',
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365,
        domain: 'localhost',
    });
};
