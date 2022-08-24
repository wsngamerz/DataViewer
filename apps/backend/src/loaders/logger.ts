import path from 'path';
import { PathLike } from 'fs';
import fs from 'fs/promises';
import winston from 'winston';

let logger: winston.Logger;
let logPath: PathLike;

// setup the logger
export const initialiseLogger = async () => {
    // create logs dir if not exists before logging
    logPath = path.normalize(path.join(__dirname, 'logs'));
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
    logger = winston.createLogger({
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
        logger.level = 'debug';
    } else {
        logger.level = 'info';
    }

    logger.info(`Running in ${process.env.NODE_ENV}`, { label: 'Logger' });
};

// returns a logger with a custom label
export const getLogger = (label = '<LABEL>') => {
    // set the lable to be displayed next to the log
    logger.defaultMeta = { label };
    return logger;
};
