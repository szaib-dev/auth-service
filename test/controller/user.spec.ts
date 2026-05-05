import { jest } from '@jest/globals';
import { UserRole } from '../../src/generated/prisma/enums';

const mockValidationResult = jest.fn();
const mockHash = jest.fn();
const mockHashMatchPass = jest.fn();
const mockGenerateAccessToken = jest.fn();
const mockGenerateRefreshToken = jest.fn();

const mockPrisma = {
    user: {
        create: jest.fn(),
        findUnique: jest.fn(),
    },
    refreshToken: {
        deleteMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
    },
};

jest.unstable_mockModule('express-validator', () => ({
    validationResult: mockValidationResult,
}));

jest.unstable_mockModule('bcryptjs', () => ({
    default: {
        hash: mockHash,
    },
}));

jest.unstable_mockModule('../../src/services/HashMatchPass.js', () => ({
    default: mockHashMatchPass,
}));

jest.unstable_mockModule('../../src/services/TokenCreation.js', () => ({
    generateAccessToken: mockGenerateAccessToken,
    generateRefreshToken: mockGenerateRefreshToken,
}));

jest.unstable_mockModule('../../src/config/db.js', () => ({
    default: mockPrisma,
}));

const {
    VerifyMyself,
    createUser,
    loginUser,
    logoutUser,
    refreshTokens,
} = await import('../../src/controller/user');

const createResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
        clearCookie: jest.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
};

describe('user controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockValidationResult.mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });
        mockGenerateRefreshToken.mockResolvedValue(undefined);
        mockHash.mockResolvedValue('hashed-password');
    });

    it('returns validation errors on user creation', async () => {
        const res = createResponse();
        mockValidationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'invalid' }],
        });

        await createUser({ body: {} } as never, res as never, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            status: 'validation error',
            error: [{ msg: 'invalid' }],
        });
    });

    it('rejects user creation when fields are missing', async () => {
        const res = createResponse();

        await createUser(
            { body: { fullname: 'User', email: '' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(402);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Please add all fields!',
        });
    });

    it('creates a user and issues tokens', async () => {
        const res = createResponse();
        const user = {
            id: 'user-1',
            email: 'user@test.com',
            fullname: 'User',
            role: UserRole.USER,
        };
        mockPrisma.user.create.mockResolvedValue(user);

        await createUser(
            {
                body: {
                    fullname: 'User',
                    email: 'user@test.com',
                    password: 'password',
                },
            } as never,
            res as never,
            next
        );

        expect(mockHash).toHaveBeenCalledWith('password', 10);
        expect(mockGenerateAccessToken).toHaveBeenCalledWith(
            { sub: user.id, role: user.role },
            res
        );
        expect(mockGenerateRefreshToken).toHaveBeenCalledWith(
            { sub: user.id, role: user.role, id: user.id },
            res
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('returns validation errors on login', async () => {
        const res = createResponse();
        mockValidationResult.mockReturnValue({
            isEmpty: () => false,
            array: () => [{ msg: 'invalid login' }],
        });

        await loginUser({ body: {} } as never, res as never, next);

        expect(res.status).toHaveBeenCalledWith(422);
    });

    it('calls next when login user is missing', async () => {
        const res = createResponse();
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await loginUser(
            { body: { email: 'missing@test.com', password: 'password' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next when login password does not match', async () => {
        const res = createResponse();
        mockPrisma.user.findUnique.mockResolvedValue({
            id: 'user-1',
            password: 'hashed',
            role: UserRole.USER,
        });
        mockHashMatchPass.mockResolvedValue(false);

        await loginUser(
            { body: { email: 'user@test.com', password: 'wrong' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('logs a user in and rotates refresh tokens', async () => {
        const res = createResponse();
        const user = {
            id: 'user-1',
            email: 'user@test.com',
            password: 'hashed',
            role: UserRole.USER,
        };
        mockPrisma.user.findUnique.mockResolvedValue(user);
        mockHashMatchPass.mockResolvedValue(true);

        await loginUser(
            { body: { email: user.email, password: 'password' } } as never,
            res as never,
            next
        );

        expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
            where: { userId: user.id },
        });
        expect(mockGenerateAccessToken).toHaveBeenCalled();
        expect(mockGenerateRefreshToken).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects self verification when auth subject is missing', async () => {
        const res = createResponse();

        await VerifyMyself(
            { auth: { sub: '' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith('No user found');
    });

    it('returns the current user id on self verification', async () => {
        const res = createResponse();

        await VerifyMyself(
            { auth: { sub: 'user-1' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ id: 'user-1' });
    });

    it('calls next when refresh token is not found', async () => {
        const res = createResponse();
        mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

        await refreshTokens(
            { auth: { id: 'rt-1', sub: 'user-1' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next when refresh token belongs to another user', async () => {
        const res = createResponse();
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
            id: 'rt-1',
            userId: 'user-2',
        });

        await refreshTokens(
            { auth: { id: 'rt-1', sub: 'user-1' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('returns 404 when refresh token user is missing', async () => {
        const res = createResponse();
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
            id: 'rt-1',
            userId: 'user-1',
        });
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await refreshTokens(
            { auth: { id: 'rt-1', sub: 'user-1' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('refreshes tokens successfully', async () => {
        const res = createResponse();
        const user = { id: 'user-1', role: UserRole.USER };
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
            id: 'rt-1',
            userId: user.id,
        });
        mockPrisma.user.findUnique.mockResolvedValue(user);

        await refreshTokens(
            { auth: { id: 'rt-1', sub: 'user-1' } } as never,
            res as never,
            next
        );

        expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
            where: { id: 'rt-1' },
        });
        expect(mockGenerateAccessToken).toHaveBeenCalled();
        expect(mockGenerateRefreshToken).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            userId: 'user-1',
            success: true,
        });
    });

    it('logs a user out and clears cookies', async () => {
        const res = createResponse();

        await logoutUser(
            { auth: { id: 'rt-1' } } as never,
            res as never,
            next
        );

        expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
            where: { id: 'rt-1' },
        });
        expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
