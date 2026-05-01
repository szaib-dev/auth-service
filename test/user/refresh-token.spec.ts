import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import jwt from 'jsonwebtoken';
import config from '../../src/config';

describe('/POST refresh token', () => {
    const data = {
        fullname: 'Ali',
        email: 'alogishassi@gmail.com',
        password: 'usernameali',
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: {
                email: data.email,
            },
        });
    });

    it('/should rotate refresh token and delete the older one.', async () => {
        const user = await prisma.user.create({
            data,
        });

        const oldRefreshToken = await prisma.refreshToken.create({
            data: {
                userId: user.id,
            },
        });

        const payload = {
            sub: user.id,
            id: oldRefreshToken.id,
        };
        const signature = jwt.sign(payload, config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
        });
        const response = await request(app)
            .post('/api/user/refresh-tokens')
            .set('Cookie', [`refreshToken=${signature}`])
            .send();

        expect(response.statusCode).toBe(200);
    });
});
