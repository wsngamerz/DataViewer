import mongoose from 'mongoose';

import { getLogger } from './logger';

export default async () => {
    // setup local logger
    const logger = getLogger('MongooseLoader');
    logger.debug('Initialising Mongoose');

    // connect to database
    const connection = await mongoose
        .connect(process.env.DATABASE_URL, {
            connectTimeoutMS: 5000,
            serverSelectionTimeoutMS: 5000,
        })
        .catch((err) => {
            logger.error('Error connecting to database');
            logger.error(err);
            logger.error('Unable to continue without a database, terminating!');
            process.exit(1);
        });

    // return the connection
    logger.debug('Initialised mongoose');
    return connection;
};
