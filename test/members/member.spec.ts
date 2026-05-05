import request from 'supertest';
import createJWKSMock from 'mock-jwks';
import app from '../../src/app';
import prisma from '../../src/config/db';
import { UserRole } from '../../src/generated/prisma/enums';

describe('member routes', () => {
    const adminData = {
        fullname: 'Admin User',
        email: 'member-admin-test@gmail.com',
        password: 'usernameali',
        role: UserRole.ADMIN,
    };

    const managerData = {
        fullname: 'Manager User',
        email: 'member-manager-test@gmail.com',
        password: 'usernameali',
        role: UserRole.MANAGER,
    };

    const createdMemberEmail = 'member-route-created@gmail.com';

    let jwk: ReturnType<typeof createJWKSMock>;
    const cleanupMembers = async () => {
        await prisma.user.deleteMany({
            where: {
                email: {
                    in: [
                        adminData.email,
                        managerData.email,
                        createdMemberEmail,
                    ],
                },
            },
        });
    };

    beforeAll(async () => {
        jwk = createJWKSMock('http://localhost:5501');
        jwk.start();
        await cleanupMembers();
    });

    beforeEach(async () => {
        await cleanupMembers();
    });

    afterEach(async () => {
        await cleanupMembers();
    });

    afterAll(async () => {
        await cleanupMembers();
        jwk.stop();
        await prisma.$disconnect();
    });

    const createUserAndToken = async (role: UserRole = UserRole.ADMIN) => {
        const seedData = role === UserRole.ADMIN ? adminData : managerData;

        const user = await prisma.user.upsert({
            where: {
                email: seedData.email,
            },
            update: {
                fullname: seedData.fullname,
                password: seedData.password,
                role: seedData.role,
            },
            create: seedData,
        });

        const accessToken = jwk.token({
            sub: user.id,
            role: user.role,
        });

        return { user, accessToken };
    };

    const createMemberRecord = async () => {
        return prisma.user.upsert({
            where: {
                email: createdMemberEmail,
            },
            update: {
                fullname: 'Existing Member',
                password: 'memberpassword',
                role: UserRole.MANAGER,
            },
            create: {
                fullname: 'Existing Member',
                email: createdMemberEmail,
                password: 'memberpassword',
                role: UserRole.MANAGER,
            },
        });
    };

    it('creates a member as manager when admin calls POST /api/member/create', async () => {
        const { accessToken } = await createUserAndToken();

        const response = await request(app)
            .post('/api/member/create')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
                fullname: 'Created Member',
                email: createdMemberEmail,
                password: '239ud9husdf',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.member.email).toBe(createdMemberEmail);
        expect(response.body.member.role).toBe(UserRole.MANAGER);
    });

    it('rejects member creation when required fields are missing', async () => {
        const { accessToken } = await createUserAndToken();

        const response = await request(app)
            .post('/api/member/create')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
                fullname: 'Created Member',
                email: createdMemberEmail,
            });

        expect(response.statusCode).toBe(400);
        expect(response.body[0].err).toBe('it looks some fields are missing');
    });

    it('lists members for an admin on GET /api/member/list', async () => {
        const { accessToken } = await createUserAndToken();
        const member = await createMemberRecord();

        const response = await request(app)
            .get('/api/member/list')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(
            response.body.list.some(
                (item: { id: string }) => item.id === member.id
            )
        ).toBe(true);
    });

    it('returns a member by id on GET /api/member/:memberId', async () => {
        const { accessToken } = await createUserAndToken();
        const member = await createMemberRecord();

        const response = await request(app)
            .get(`/api/member/${member.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.statusCode).toBe(201);
        expect(response.body.member.id).toBe(member.id);
        expect(response.body.member.email).toBe(member.email);
    });

    it('updates a member on PATCH /api/member/update/:memberId', async () => {
        const { accessToken } = await createUserAndToken();
        const member = await createMemberRecord();

        const response = await request(app)
            .patch(`/api/member/update/${member.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({
                fullname: 'Updated Member',
                role: UserRole.ADMIN,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.member.fullname).toBe('Updated Member');
        expect(response.body.member.role).toBe(UserRole.ADMIN);
    });

    it('rejects member update when no update payload is provided', async () => {
        const { accessToken } = await createUserAndToken();
        const member = await createMemberRecord();

        const response = await request(app)
            .patch(`/api/member/update/${member.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body[0].err).toBe(
            'Please provide data to update member'
        );
    });

    it('deletes a member on DELETE /api/member/delete/:memberId', async () => {
        const { accessToken } = await createUserAndToken();
        const member = await createMemberRecord();

        const response = await request(app)
            .delete(`/api/member/delete/${member.id}`)
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.statusCode).toBe(201);
        expect(response.body.success).toBe(true);

        const deletedMember = await prisma.user.findUnique({
            where: {
                id: member.id,
            },
        });

        expect(deletedMember).toBeNull();
    });

    it('blocks non-admin users from member routes', async () => {
        const { accessToken } = await createUserAndToken(UserRole.MANAGER);

        const response = await request(app)
            .get('/api/member/list')
            .set('Cookie', [`accessToken=${accessToken}`])
            .send();

        expect(response.statusCode).toBe(403);
        expect(response.body[0].err).toBe(
            "This role don't have permission for this."
        );
    });
});
