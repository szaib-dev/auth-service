import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe.skip('Good', () => {
    const user = {
        fullname: 'Shahzaib',
        email: 'test@mail.com',
        password: '1odi2o392d',
    };

    describe('/POST create user', () => {
        // create new user
        it('should return 201', async () => {
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
    });

    // DB CONNECTION CLOSE
    afterAll(async () => {
        await prisma.$disconnect();
    });
});

describe('BAD', () => {
    describe('/USER POST', () => {
        it('should return 422', async () => {
            const result = await request(app).post('/api/user/register').send({
                fullname: 'Shahzaib',
                email: 'szaib.dev@gmail.com0',
                password: '',
            });

            expect(result.statusCode).toBe(422);
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
