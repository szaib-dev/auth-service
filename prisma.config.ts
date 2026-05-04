import { defineConfig } from 'prisma/config';
import Config from './src/config/index.js';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: Config.DATABASE_URL as string,
    },
});
