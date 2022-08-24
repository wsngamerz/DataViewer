import mongoose from 'mongoose';

import { getLogger } from './logger';

export default async () => {
    // get local logger
    const logger = getLogger('MongooseLoader');
    logger.debug('Initialising Mongoose');

    // connect to database
    await mongoose
        .connect(process.env.DATABASE_URL, {
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 5000,
        })
        .catch((err) => {
            logger.error('Error connecting to database', {
                label: 'MongooseLoader',
            });
            logger.error(err, { label: 'MongooseLoader' });
            logger.error(
                'Unable to continue without a database, terminating!',
                { label: 'MongooseLoader' }
            );
            process.exit(1);
        });

    // return the connection
    logger.debug('Initialised mongoose');
};
