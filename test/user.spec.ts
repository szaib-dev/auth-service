import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/db';

describe('USER TEST', () => {

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

        // delete after success;
            await prisma.user.delete({
                where: {
                    email: user.email,
                },
            });

        });
    });

    // DB CONNECTION CLOSE
    afterAll(async()=>{
        await prisma.$disconnect();
    })
    
});
