import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';

describe('/POST create tenant', () => {
    const data = {
        name: 'Bula',
        address: 'Bula near karao',
    };

    it('/should return 201 status code', async () => {
        const response = await request(app)
            .post('/api/tenat/create')
            .send(data);

        expect(response.statusCode).toBe(201);
    });
});
