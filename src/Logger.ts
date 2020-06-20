import * as winston from 'winston';
import * as path from 'path';

const logsDir = path.join(__dirname, '../logs');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: `${logsDir}/info.log`, level: 'info' }),
        new winston.transports.File({ filename: `${logsDir}/errors.log`, handleExceptions: true, level: 'error' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: `${logsDir}/exceptions.log` })
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console());
}

export default logger;