import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import jwt from 'jsonwebtoken';
import config from '../../src/config';
import createJWKSMock from 'mock-jwks';
import { UserRole } from '../../src/generated/prisma/enums';

describe('/PATCH update tenant with id', () => {
    const data = {
        fullname: 'Ali',
        email: 'alp@gmail.com',
        password: 'usernameali',
        role: UserRole.ADMIN,
    };

    const tenantId = 'cmomw6v2r0000t8vt6sjoq3mq';

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
        const tenantUpdate = {
            name: 'Pola125',
        };

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
            .patch(`/api/tenant/update/${tenantId}`)
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send(tenantUpdate);

        expect(response.statusCode).toBe(200);
    });

    it('should return updated name of tenant', async () => {
        const tenantUpdate = {
            name: 'YingYong',
        };

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
            .patch(`/api/tenant/update/${tenantId}`)
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send(tenantUpdate);


        expect(response.body.tenant.name).toBe(tenantUpdate.name);
    });
});
