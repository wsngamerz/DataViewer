import winston from 'winston';

export default class Logger {
    /**
     * The label that will be displayed next to each log sent by this instance
     *
     * @private
     * @type {string}
     * @memberof Logger
     */
    private label: string;

    /**
     * The underlying winston logger
     *
     * @private
     * @static
     * @type {winston.Logger}
     * @memberof Logger
     */
    private static logger: winston.Logger;

    /**
     * Map of loggers with the key being the label
     *
     * @private
     * @static
     * @type {Map<string, Logger>}
     * @memberof Logger
     */
    private static logInstances: Map<string, Logger>;

    /**
     * Create a logger with a label
     * @param label The loggers label
     */
    private constructor(label: string) {
        this.label = label;
    }

    /**
     * Set the winston logger
     * @param logger the logger
     */
    public static setWinstonLogger(logger: winston.Logger) {
        Logger.logger = logger;
    }

    /**
     * Gets a logger with a label. If one doesn't exist, it will create a new one
     * @param label the logger label
     * @returns a logger with a label
     */
    public static getLogger(label = 'DataViewer'): Logger {
        // if alternative instances map doesn't exist, create it
        if (!Logger.logInstances)
            Logger.logInstances = new Map<string, Logger>();

        // need to create a logger for the label if it doesn't exist already
        if (!Logger.logInstances.has(label)) {
            Logger.logInstances.set(label, new Logger(label));
        }

        // return the named logger
        return Logger.logInstances.get(label);
    }

    log(level: string, message: string) {
        // if the winston logger has not been applied, fallback to console.log
        if (!Logger.logger) {
            console.log(`[${this.label}] ${level}: ${message}`);
            return;
        }

        Logger.logger.log(level, message, { label: this.label });
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
        this.log('http', message);
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
