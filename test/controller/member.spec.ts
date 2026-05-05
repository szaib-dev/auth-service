import { jest } from '@jest/globals';
import { UserRole } from '../../src/generated/prisma/enums';

const mockPrisma = {
    user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/db.js', () => ({
    default: mockPrisma,
}));

const {
    createMember,
    deleteMemberById,
    getMemberById,
    listOfMembers,
    updateMemberById,
} = await import('../../src/controller/member');

const createResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
};

describe('member controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects member creation when fields are missing', async () => {
        const res = createResponse();

        await createMember(
            { body: { fullname: 'A', email: '' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('creates a member successfully', async () => {
        const res = createResponse();
        const member = {
            id: 'member-1',
            email: 'member@test.com',
            fullname: 'Member',
            role: UserRole.MANAGER,
        };

        mockPrisma.user.create.mockResolvedValue(member);

        await createMember(
            {
                body: {
                    fullname: 'Member',
                    email: 'member@test.com',
                    password: 'password',
                },
            } as never,
            res as never,
            next
        );

        expect(mockPrisma.user.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ member });
    });

    it('returns a member by id', async () => {
        const res = createResponse();
        const member = {
            id: 'member-1',
            email: 'member@test.com',
            fullname: 'Member',
            role: UserRole.MANAGER,
            tenantId: null,
        };

        mockPrisma.user.findUnique.mockResolvedValue(member);

        await getMemberById(
            { params: { memberId: 'member-1' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ member });
    });

    it('calls next when member lookup fails', async () => {
        const res = createResponse();
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await getMemberById(
            { params: { memberId: 'missing' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('deletes an existing member', async () => {
        const res = createResponse();
        mockPrisma.user.findFirst.mockResolvedValue({ id: 'member-1' });

        await deleteMemberById(
            { params: { memberId: 'member-1' } } as never,
            res as never,
            next
        );

        expect(mockPrisma.user.delete).toHaveBeenCalledWith({
            where: { id: 'member-1' },
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('calls next when deleting a missing member', async () => {
        const res = createResponse();
        mockPrisma.user.findFirst.mockResolvedValue(null);

        await deleteMemberById(
            { params: { memberId: 'missing' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('rejects empty update payloads', async () => {
        const res = createResponse();

        await updateMemberById(
            { params: { memberId: 'member-1' }, body: {} } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('calls next when updating a missing member', async () => {
        const res = createResponse();
        mockPrisma.user.findFirst.mockResolvedValue(null);

        await updateMemberById(
            {
                params: { memberId: 'missing' },
                body: { fullname: 'Updated' },
            } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('updates a member successfully', async () => {
        const res = createResponse();
        const updatedMember = {
            id: 'member-1',
            email: 'member@test.com',
            fullname: 'Updated',
            role: UserRole.ADMIN,
        };

        mockPrisma.user.findFirst.mockResolvedValue({ id: 'member-1' });
        mockPrisma.user.update.mockResolvedValue(updatedMember);

        await updateMemberById(
            {
                params: { memberId: 'member-1' },
                body: { fullname: 'Updated', role: UserRole.ADMIN },
            } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            member: updatedMember,
        });
    });

    it('returns the member list', async () => {
        const res = createResponse();
        const members = [{ id: 'member-1' }];
        mockPrisma.user.findMany.mockResolvedValue(members);

        await listOfMembers({} as never, res as never, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ success: true, list: members });
    });

    it('calls next when there are no members', async () => {
        const res = createResponse();
        mockPrisma.user.findMany.mockResolvedValue([]);

        await listOfMembers({} as never, res as never, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
