import express from 'express';
import compression from 'compression';

import Logger from '../logger';
import apiRouter from '../api';

export default async ({ app }: { app: express.Application }) => {
    // get local logger
    const logger = new Logger('ExpressLoader');
    logger.debug('Initialising express');

    // add middlwares
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(requestLogger);
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
        res.json({ error: err });
    });

    // return the express application
    logger.debug('Initialised express');
    return app;
};

// custom logging middlware
const reqLog = new Logger('Web');
const requestLogger = (req, res, next) => {
    reqLog.http(`request ${req.method} ${req.originalUrl}`);
    next();
};
