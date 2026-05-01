import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import createJWKSMock from 'mock-jwks';

describe('/ Logout Test', () => {
    const data = {
        fullname: 'Ali',
        email: 'alsssssssssi@gmail.com',
        password: 'usernameali',
    };

    let jwk: ReturnType<typeof createJWKSMock>;

    beforeAll(() => {
        jwk = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        await jwk.start();
    });

    afterEach(async () => {
        await jwk.stop();
    });

    it('should return 200 status code and logout user', async () => {
        let user = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            user = await prisma.user.create({
                data,
            });
        }

        let token = await prisma.refreshToken.findUnique({
            where: {
                userId: user.id,
            },
        });

        if (!token) {
            token = await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                },
            });
        }

        const accessTokenSignature = jwk.token({
            sub: user.id,
            role: user.role,
        });

        const refreshTokenSignature = jwt.sign(
            {
                sub: user.id,
                id: token.id,
                role: user.role,
            },
            config.REFRESH_TOKEN_SECRET!,
            {
                algorithm: 'HS256',
            }
        );

        const response = await request(app)
            .post('/api/user/logout')
            .set('Cookie', [
                `accessToken=${accessTokenSignature}`,
                `refreshToken=${refreshTokenSignature}`,
            ]);

        expect(response.statusCode).toBe(200);
    });
});
