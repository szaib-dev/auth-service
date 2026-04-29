import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import { isJWT } from '../../src/utils';

describe('/ Login a User', () => {
    const user = {
        fullname: 'testemailforlogin',
        email: 'test-login@gmail.com',
        password: 'testpassword',
    };

    beforeAll(async () => {
        await prisma.user.deleteMany({
            where: { email: user.email },
        });

        await request(app).post('/api/user/register').send(user);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: user.email },
        });

        await prisma.$disconnect();
    });

    describe(' Good Requests ', () => {
        it('should return 200 status code', async () => {
            const response = await request(app)
                .post('/api/user/login')
                .send(user);

            expect(response.statusCode).toBe(200);
        });

        it('should check return email if logged in successfully', async () => {
            const response = await request(app)
                .post('/api/user/login')
                .send(user);

            expect(response.body.user.email).toBe(user.email);
        });

        it('should check accessToken and refreshToken in cookies', async () => {
            const response = await request(app)
                .post('/api/user/login')
                .send(user);

            const cookies =
                (response.headers as unknown as { 'set-cookie': string[] })[
                    'set-cookie'
                ] ?? [];

            const accessToken =
                cookies
                    .find((cookie) => cookie.startsWith('accessToken'))
                    ?.split(';')[0]
                    .split('=')[1] ?? null;
            const refreshToken =
                cookies
                    .find((cookie) => cookie.startsWith('refreshToken'))
                    ?.split(';')[0]
                    .split('=')[1] ?? null;

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });
    });
});
