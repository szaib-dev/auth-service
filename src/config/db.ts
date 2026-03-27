// sets up and exports the prisma database connection

import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import Config from './index.js';

const connectionString = Config.DATABASE_URL;
if (!connectionString || connectionString.length === 0) {
    throw new Error('Database connection string not found!');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
