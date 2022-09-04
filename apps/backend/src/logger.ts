import winston from 'winston';

import { getLogger } from './loaders/winston';

export default class Logger {
    label: string;
    logger: winston.Logger;

    constructor(label: string) {
        this.label = label;
        this.logger = getLogger();
    }

    log(level: string, message: string) {
        this.logger.log(level, message, { label: this.label });
    }

    error(message: string) {
        this.log('error', message);
    }

    warn(message: string) {
        this.log('warn', message);
    }

    info(message: string) {
        this.log('info', message);
    }

    http(message: string) {
        this.log('error', message);
    }

    verbose(message: string) {
        this.log('verbose', message);
    }

    debug(message: string) {
        this.log('debug', message);
    }

    silly(message: string) {
        this.log('silly', message);
    }
}
