import express from 'express';
import compression from 'compression';

import Logger from '@data-viewer/shared/logger';
import apiRouter from '../api';

export default async ({ app }: { app: express.Application }) => {
    // get local logger
    const logger = Logger.getLogger('ExpressLoader');
    const webLogger = Logger.getLogger('Web');
    logger.debug('Initialising express');

    // add middlwares
    app.use((req, res, next) => {
        // custom web request logging
        webLogger.http(`${req.method} ${req.originalUrl}`);
        next();
    });
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(compression());

    // add routers
    app.use('/api', apiRouter());

    // 404
    app.use((req, res, next) => {
        res.status(404);
        res.json({ error: '404' });
    });

    // handle errors.
    app.use((err, req, res, _) => {
        Object.defineProperty(err, 'message', { enumerable: true });

        res.status(err.status || 500);
        res.json({ error: err, stack: err.stack });
    });

    // return the express application
    logger.debug('Initialised express');
    return app;
};
