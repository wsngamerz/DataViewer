import path from 'path';
import fs from 'fs/promises';
import winston from 'winston';

import Logger from '@data-viewer/shared/logger';

// setup the logger
export const initialiseLogger = async () => {
    // create logs dir if not exists before logging
    const logPath = path.normalize(path.join(__dirname, 'logs'));
    await fs.mkdir(logPath, { recursive: true });

    // setup the formatting
    const logTemplate = winston.format.printf(
        ({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        }
    );

    // create the default format
    const logFormat = winston.format.combine(
        winston.format.timestamp(),
        logTemplate
    );

    // create the logger
    const logger = winston.createLogger({
        level: 'info',
        format: logFormat,
        transports: [
            // file transports with a main and an error specific file
            new winston.transports.File({
                filename: 'error.log',
                level: 'error',
                dirname: logPath,
            }),
            new winston.transports.File({
                filename: 'main.log',
                dirname: logPath,
            }),

            // console transport with extended format for colours
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize({
                        all: true,
                    }),
                    logFormat
                ),
            }),
        ],
    });

    // Change the log level based on environment
    if (process.env.NODE_ENV !== 'production') {
        logger.level = 'silly';
    } else {
        logger.level = 'info';
    }

    // apply to logger
    Logger.setWinstonLogger(logger);
    Logger.getLogger().info(`Running in ${process.env.NODE_ENV}`);
};
