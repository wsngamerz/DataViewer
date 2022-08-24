import express from 'express';

import loaders from './loaders';
import { initialiseLogger, getLogger } from './loaders/logger';

async function startServer() {
    // initialise the logger and create one for the server
    await initialiseLogger();
    const logger = getLogger('Server');
    logger.info('Starting DataViewer');

    // create express application
    const app = express();

    // initialise dependencies
    await loaders({ expressApp: app });

    // start express server
    app.listen(process.env.PORT, () => {
        logger.info('Web Server started');
    });
}

startServer();
