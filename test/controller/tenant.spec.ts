import { jest } from '@jest/globals';

const mockPrisma = {
    resturants: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/db.js', () => ({
    default: mockPrisma,
}));

const {
    createTenant,
    deleteTenant,
    findTenant,
    tenantsList,
    updateTenant,
} = await import('../../src/controller/tenant');

const createResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    };
    res.status.mockReturnValue(res);
    return res;
};

describe('tenant controller', () => {
    const next = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('rejects tenant creation when fields are missing', async () => {
        const res = createResponse();

        await createTenant(
            { body: { name: 'Tenant' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(mockPrisma.resturants.create).not.toHaveBeenCalled();
    });

    it('creates a tenant successfully', async () => {
        const res = createResponse();
        mockPrisma.resturants.create.mockResolvedValue({ id: 'tenant-1' });

        await createTenant(
            { body: { name: 'Tenant', address: 'Address' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            tenantId: 'tenant-1',
        });
    });

    it('returns the tenant list', async () => {
        const res = createResponse();
        const list = [{ id: 'tenant-1' }];
        mockPrisma.resturants.findMany.mockResolvedValue(list);

        await tenantsList({} as never, res as never, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ list });
    });

    it('calls next when tenant list is null', async () => {
        const res = createResponse();
        mockPrisma.resturants.findMany.mockResolvedValue(null);

        await tenantsList({} as never, res as never, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects tenant updates with no payload', async () => {
        const res = createResponse();

        await updateTenant(
            { params: { tenantId: 'tenant-1' }, body: {} } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('rejects tenant updates when id is missing', async () => {
        const res = createResponse();

        await updateTenant(
            { params: {}, body: { name: 'Updated' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next when updating a missing tenant', async () => {
        const res = createResponse();
        mockPrisma.resturants.findUnique.mockResolvedValue(null);

        await updateTenant(
            { params: { tenantId: 'missing' }, body: { name: 'Updated' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('updates a tenant successfully', async () => {
        const res = createResponse();
        const tenant = { id: 'tenant-1', name: 'Updated', address: 'Address' };
        mockPrisma.resturants.findUnique.mockResolvedValue({ id: 'tenant-1' });
        mockPrisma.resturants.update.mockResolvedValue(tenant);

        await updateTenant(
            {
                params: { tenantId: 'tenant-1' },
                body: { name: 'Updated', address: 'Address' },
            } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ tenant });
    });

    it('rejects deletes when tenant id is missing', async () => {
        const res = createResponse();

        await deleteTenant(
            { params: {} } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next when deleting a missing tenant', async () => {
        const res = createResponse();
        mockPrisma.resturants.findUnique.mockResolvedValue(null);

        await deleteTenant(
            { params: { tenantId: 'missing' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('deletes a tenant successfully', async () => {
        const res = createResponse();
        mockPrisma.resturants.findUnique.mockResolvedValue({ id: 'tenant-1' });

        await deleteTenant(
            { params: { tenantId: 'tenant-1' } } as never,
            res as never,
            next
        );

        expect(mockPrisma.resturants.delete).toHaveBeenCalledWith({
            where: { id: 'tenant-1' },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            tenant: 'tenant-1',
            success: true,
        });
    });

    it('rejects tenant lookup when id is missing', async () => {
        const res = createResponse();

        await findTenant(
            { params: {} } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next when a tenant cannot be found', async () => {
        const res = createResponse();
        mockPrisma.resturants.findUnique.mockResolvedValue(null);

        await findTenant(
            { params: { tenantId: 'missing' } } as never,
            res as never,
            next
        );

        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('finds a tenant successfully', async () => {
        const res = createResponse();
        const tenant = { id: 'tenant-1' };
        mockPrisma.resturants.findUnique.mockResolvedValue(tenant);

        await findTenant(
            { params: { tenantId: 'tenant-1' } } as never,
            res as never,
            next
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ tenant, success: true });
    });
});
