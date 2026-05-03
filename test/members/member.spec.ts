import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/db';
import createJWKSMock from 'mock-jwks';
import { UserRole } from '../../src/generated/prisma/enums';

describe('/POST create new members by admin only', () => {
    const data = {
        fullname: 'Ali',
        email: 'alsssofsdssi@gmail.com',
        password: 'usernameali',
        role: UserRole.ADMIN,
    };

    const member = {
        fullname: 'Shhazaib',
        email: 'wehjfdfedj@gmail.com',
        password: '239ud9husdf'
    }

    let jwk: ReturnType<typeof createJWKSMock>;

    beforeAll(() => {
        jwk = createJWKSMock('http://localhost:5501');
    });

    beforeEach(async () => {
        jwk.start();
        await prisma.user.deleteMany({
            where: {
                email: member.email
            }
        })
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
            .post('/api/member/create')
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send(member);

        expect(response.statusCode).toBe(201);
    });


    it('should create manager only', async () => {
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
            .post('/api/member/create')
            .set('Cookie', [`accessToken=${accessTokenSignature}`])
            .send(member);

        expect(response.body.member.role).toBe('MANAGER');
    });
});
