import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import createJWKSMock from 'mock-jwks';
import { UserRole } from '../../src/generated/prisma/enums';

describe('/POST create new tenants', () => {
    const data = {
        fullname: 'Ali',
        email: 'alssssss23sdsssi@gmail.com',
        password: 'usernameali',
        role: UserRole.ADMIN,
    };

    const tenant = {
        name: 'My First Tenant',
        address: 'This is my first address',
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

    it('should return 201 status code', async () => {
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
            .post('/api/tenant/create')
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send(tenant);

        console.log('==========response========', response.body);

        expect(response.statusCode).toBe(201);
    });
});
