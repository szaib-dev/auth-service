import * as winston from 'winston';

const logger = winston.createLogger({
    defaultMeta: {
        service: 'auth-service',
    },
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.prettyPrint(),
                winston.format.label({ label: 'right meow!' }),
                winston.format.json()
            ),
        }),
        new winston.transports.File({
            level: 'info',
            dirname: 'logs',
            filename: 'logger.log',
            format: winston.format.combine(
                winston.format.json(),
                winston.format.prettyPrint()
            ),
        }),
    ],
});

export default logger;
