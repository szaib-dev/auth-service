import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';
import { isJWT } from '../src/utils/index';

describe('Good', () => {
    const user = {
        fullname: 'Shahzaib',
        email: 'testing@mail.com',
        password: '1odi2o392d',
    };

    describe('/POST create user', () => {
        // create new user
        it('should return 201', async () => {
            // check does user exist
            const isUserExist = await prisma.user.findUnique({
                where: {
                    email: user.email,
                },
            });

            if (isUserExist) {
                // delete if user exist;
                await prisma.user.delete({
                    where: {
                        email: user.email,
                    },
                });
            }

            const result = await request(app)
                .post('/api/user/register')
                .send(user);
            expect(result.statusCode).toBe(201);
        });

        // check is password hashed or not
        it('should save hashed password', async () => {
            const isHashedPass = await prisma.user.findUnique({
                where: { email: user.email },
                select: { password: true },
            });

            expect(isHashedPass!.password).not.toBe(user.password);

            // delete after success;
            await prisma.user.delete({
                where: {
                    email: user.email,
                },
            });
        });

        it('should return access token and refresh token in cookies', async () => {
            const response = await request(app)
                .post('/api/user/register')
                .send(user);

            const cookies =
                (response.headers as unknown as { 'set-cookie': string[] })[
                    'set-cookie'
                ] ?? [];

            const accessToken =
                cookies
                    .find((c) => c.startsWith('accessToken='))
                    ?.split(';')[0]
                    .split('=')[1] ?? null;

            const refreshToken =
                cookies
                    .find((c) => c.startsWith('refreshToken='))
                    ?.split(';')[0]
                    .split('=')[1] ?? null;

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJWT(accessToken)).toBe(true);
            expect(isJWT(refreshToken)).toBe(true);

            // delete after success;
            await prisma.user.delete({
                where: {
                    email: user.email,
                },
            });
        });

        // DB CONNECTION CLOSE
        afterAll(async () => {
            await prisma.$disconnect();
        });
    });
});

describe('BAD', () => {
    describe('/USER POST', () => {
        it('should return 422', async () => {
            const result = await request(app).post('/api/user/register').send({
                fullname: 'Shahzaib',
                email: 'szaib.dev@gmail.com',
                password: '',
            });

            expect(result.statusCode).toBe(422);
        });

        it('should trim spaces from email before saving', async () => {
            const user = {
                fullname: 'Shahzaib',
                email: '  szaiibbb.dev@gmail.com  ',
                password: 'fivewords',
            };
            const result = await request(app)
                .post('/api/user/register')
                .send(user);

            console.log(result.statusCode, '----', result.body);

            expect(result.body.user.email).toBe('szaiibbb.dev@gmail.com');

            // delete after success;
            await prisma.user.delete({
                where: {
                    email: 'szaiibbb.dev@gmail.com',
                },
            });
        });

        it(`should have fullname as empty`, async () => {
            const result = await request(app).post('/api/user/register').send({
                fullname: '',
                email: 'szaib.dev@gmail.com0',
                password: 'OnePass',
            });

            expect(result.statusCode).toBe(422);
        });

        it(`should email as empty`, async () => {
            const result = await request(app).post('/api/user/register').send({
                fullname: '',
                email: '',
                password: 'OnePass',
            });

            expect(result.statusCode).toBe(422);
        });
    });
});
