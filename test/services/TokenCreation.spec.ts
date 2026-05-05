import { jest } from '@jest/globals';

const signMock = jest.fn();
const refreshTokenCreateMock = jest.fn();

const configMock = {
    PRIVATE_KEY_SECRET: 'private-secret',
    REFRESH_TOKEN_SECRET: 'refresh-secret',
};

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
        sign: signMock,
    },
}));

jest.unstable_mockModule('../../src/config/index.js', () => ({
    default: configMock,
}));

jest.unstable_mockModule('../../src/config/db.js', () => ({
    default: {
        refreshToken: {
            create: refreshTokenCreateMock,
        },
    },
}));

const tokenModule = await import('../../src/services/TokenCreation');

describe('token creation helpers', () => {
    const createResponse = () =>
        ({
            cookie: jest.fn(),
        }) as never;

    beforeEach(() => {
        jest.clearAllMocks();
        configMock.PRIVATE_KEY_SECRET = 'private-secret';
        configMock.REFRESH_TOKEN_SECRET = 'refresh-secret';
        signMock.mockReturnValue('signed-token');
        refreshTokenCreateMock.mockResolvedValue({ id: 'rt-1' });
    });

    it('throws when the private key is missing', () => {
        configMock.PRIVATE_KEY_SECRET = '';

        expect(() =>
            tokenModule.generateAccessToken({ sub: 'user-1' }, createResponse())
        ).toThrow('Private Key is missing');
    });

    it('sets the access token cookie', () => {
        const res = createResponse();

        tokenModule.generateAccessToken({ sub: 'user-1' }, res);

        expect(signMock).toHaveBeenCalledWith(
            { sub: 'user-1' },
            'private-secret',
            expect.objectContaining({
                algorithm: 'RS256',
                issuer: 'auth-service',
                expiresIn: '1h',
            })
        );
        expect(res.cookie).toHaveBeenCalledWith(
            'accessToken',
            'signed-token',
            expect.objectContaining({
                httpOnly: true,
                domain: 'localhost',
            })
        );
    });

    it('throws when the refresh token secret is missing', async () => {
        configMock.REFRESH_TOKEN_SECRET = '';

        await expect(
            tokenModule.generateRefreshToken(
                { sub: 'user-1', id: 'user-1' },
                createResponse()
            )
        ).rejects.toThrow('refresh token secret is missing');
    });

    it('stores and sets the refresh token cookie', async () => {
        const res = createResponse();

        await tokenModule.generateRefreshToken(
            { sub: 'user-1', id: 'user-1' },
            res
        );

        expect(refreshTokenCreateMock).toHaveBeenCalledWith({
            data: { userId: 'user-1' },
        });
        expect(signMock).toHaveBeenCalledWith(
            { sub: 'user-1', id: 'rt-1' },
            'refresh-secret',
            expect.objectContaining({
                algorithm: 'HS256',
                issuer: 'auth-service',
                expiresIn: '1y',
            })
        );
        expect(res.cookie).toHaveBeenCalledWith(
            'refreshToken',
            'signed-token',
            expect.objectContaining({
                httpOnly: true,
                domain: 'localhost',
            })
        );
    });
});
