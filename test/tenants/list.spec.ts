import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import createJWKSMock from 'mock-jwks';
import { UserRole } from '../../src/generated/prisma/enums';

describe('/GET list of tenants', () => {
    const data = {
        fullname: 'Ali',
        email: 'alp@gmail.com',
        password: 'usernameali',
        role: UserRole.ADMIN,
    };

    let jwk: ReturnType<typeof createJWKSMock>;

    beforeAll(() => {
        jwk = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        jwk.start();
    });

    afterEach(async () => {
        jwk.stop();
    });

    it('should return 200 status code', async () => {
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

        const accessTokenSignature = jwk.token({
            sub: user.id,
            role: user.role,
        });

        const response = await request(app)
            .get('/api/tenant/list')
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send();


        expect(response.statusCode).toBe(200);
    });
});
