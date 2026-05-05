import { jest } from '@jest/globals';

const expressjwtMock = jest.fn(() => 'mocked-middleware');
const expressJwtSecretMock = jest.fn(() => 'mocked-secret');

jest.unstable_mockModule('express-jwt', () => ({
    expressjwt: expressjwtMock,
}));

jest.unstable_mockModule('jwks-rsa', () => ({
    default: {
        expressJwtSecret: expressJwtSecretMock,
    },
}));

const authentication = await import('../../src/middleware/authentication');

describe('authentication middleware config', () => {
    it('builds the middleware with the jwks secret and reads bearer tokens first', () => {
        void authentication.default;

        expect(expressJwtSecretMock).toHaveBeenCalled();
        expect(expressjwtMock).toHaveBeenCalledWith(
            expect.objectContaining({
                algorithms: ['RS256'],
                secret: 'mocked-secret',
                getToken: expect.any(Function),
            })
        );

        const options = expressjwtMock.mock.calls[0]?.[0];
        expect(
            options.getToken({
                headers: { authorization: 'Bearer header-token' },
                cookies: { accessToken: 'cookie-token' },
            })
        ).toBe('header-token');
        expect(
            options.getToken({
                headers: {},
                cookies: { accessToken: 'cookie-token' },
            })
        ).toBe('cookie-token');
        expect(options.getToken({ headers: {}, cookies: {} })).toBeUndefined();
    });
});
