import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('/ Logout Test', () => {
    const data = {
        fullname: 'Ali',
        email: 'alsssi@gmail.com',
        password: 'usernameali',
    };

    it('/should return 200 status code', async () => {
        const response = await request(app).post('/api/user/logout').send();

        expect(response.statusCode).toBe(200);
    });
});
