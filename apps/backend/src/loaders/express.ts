import express from 'express';

import { getLogger } from './logger';

export default async ({ app }: { app: express.Application }) => {
    const logger = getLogger('ExpressLoader');
    logger.debug('Initialising express');

    // add middlwares
    app.use(express.json());

    // return the express application
    logger.debug('Initialised express');
    return app;
};
