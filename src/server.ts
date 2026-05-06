import app from './app.js';
import Config from './config/index.js';
import logger from './config/logger.js';
import bootstrapAdmin from './services/bootstrapAdmin.js';

const startServer = async () => {
    try {
        await bootstrapAdmin();

        app.listen(Config.PORT, () => {
            logger.info('Server is running', { port: Config.PORT });
        });
    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
};

startServer();