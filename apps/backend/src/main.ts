import express from 'express';

import loaders from './loaders';
import { initialiseLogger } from './loaders/winston';
import Logger from './logger';

async function startServer() {
    // initialise the logger and create one for the server
    await initialiseLogger();
    const logger = Logger.getLogger();
    logger.info('Starting DataViewer');

    // create express application
    const app = express();

    // initialise dependencies
    await loaders({ expressApp: app });

    // start express server
    const server = app.listen(process.env.PORT, () => {
        logger.info('Web Server started');
    });

    // Handling Error
    process.on('unhandledRejection', (err: Error) => {
        logger.error(`An error occurred: ${err.message}`);
        logger.silly(`stack: ${err.stack}`);
        server.close(() => process.exit(1));
    });
}

startServer();
