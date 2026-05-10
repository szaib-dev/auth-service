import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import config from '../config/index.js';
import { UserRole } from '../generated/prisma/enums.js';

const BootStrapAdmin = async () => {
    const adminName = config.ADMIN_NAME;
    const adminEmail = config.ADMIN_EMAIL;
    const adminPassword = config.ADMIN_PASS;

    if (!adminName || !adminEmail || !adminPassword) {
        throw new Error('Admin startup credentials are missing');
    }

    try {
        const admin = await prisma.user.findUnique({
            where: {
                email: adminEmail,
            },
        });

        if (admin) {
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        await prisma.user.create({
            data: {
                fullname: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
        });
    } catch (error) {
        console.error('Bootstrap admin failed:', error);
        throw error;
    }
};

export default BootStrapAdmin;
