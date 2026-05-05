import { jest } from '@jest/globals';
import { isJWT } from '../../src/utils';

describe('src/utils/isJWT', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns false when token is missing', () => {
        expect(isJWT(null)).toBe(false);
    });

    it('returns false when token does not have three segments', () => {
        expect(isJWT('header.payload')).toBe(false);
    });

    it('returns true for a three-part token', () => {
        expect(isJWT('aGVhZGVy.cGF5bG9hZA.c2lnbmF0dXJl')).toBe(true);
    });

    it('returns false when decoding throws', () => {
        const bufferSpy = jest.spyOn(Buffer, 'from').mockImplementation(() => {
            throw new Error('decode failed');
        });
        const consoleSpy = jest
            .spyOn(console, 'log')
            .mockImplementation(() => undefined);

        expect(isJWT('header.payload.signature')).toBe(false);
        expect(bufferSpy).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
    });
});
