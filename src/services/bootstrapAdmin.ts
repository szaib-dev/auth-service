import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { UserRole } from '../generated/prisma/enums.js';

const BootStrapAdmin = async () => {
    const adminName = config.ADMIN_NAME;
    const adminEmail = config.ADMIN_EMAIL;
    const adminPassword = config.ADMIN_PASS;

    if (!adminEmail || !adminPassword) {
        throw new Error('Admin Startup Credentials Missing');
    }

    const admin = await prisma.user.findUnique({
        where: {
            email: adminEmail,
        },
    });

    if (admin) {
        return;
    }

    if (!adminName) {
        throw new Error('Cannot create admin credentials are missing');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    try {
        await prisma.user.create({
            data: {
                fullname: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
        });
    } catch (error) {
        throw new Error('Failed to create admin user', { cause: error });
    }
};

export default BootStrapAdmin;
