import app from './app.js';
import Config from './config/index.js';
import logger from './config/logger.js';

app.listen(Config.PORT, () =>
    logger.info('Server is running', { port: Config.PORT })
);
