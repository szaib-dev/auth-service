import { jest } from '@jest/globals';

const prismaClientMock = jest.fn();
const prismaPgMock = jest.fn();

const configMock = {
    DATABASE_URL: 'postgres://db-url',
};

jest.unstable_mockModule('../../src/generated/prisma/client.js', () => ({
    PrismaClient: prismaClientMock,
}));

jest.unstable_mockModule('@prisma/adapter-pg', () => ({
    PrismaPg: prismaPgMock,
}));

jest.unstable_mockModule('../../src/config/index.js', () => ({
    default: configMock,
}));

describe('db config', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        configMock.DATABASE_URL = 'postgres://db-url';
        prismaPgMock.mockImplementation(() => ({ adapter: true }));
        prismaClientMock.mockImplementation(() => ({ client: true }));
    });

    it('creates a prisma client with the pg adapter', async () => {
        const dbModule = await import('../../src/config/db');

        expect(prismaPgMock).toHaveBeenCalledWith({
            connectionString: 'postgres://db-url',
        });
        expect(prismaClientMock).toHaveBeenCalledWith({
            adapter: { adapter: true },
        });
        expect(dbModule.default).toEqual({ client: true });
    });

    it('throws when the database url is missing', async () => {
        configMock.DATABASE_URL = '';

        await expect(import('../../src/config/db?missing-url')).rejects.toThrow(
            'Database connection string not found!'
        );
    });
});
