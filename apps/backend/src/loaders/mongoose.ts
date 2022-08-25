import mongoose from 'mongoose';

import { getLogger } from './logger';

export default async () => {
    // get local logger
    const logger = getLogger('MongooseLoader');
    logger.debug('Initialising mongoose');

    // connect to database
    await mongoose.connect(process.env.DATABASE_URL, {}).catch((err) => {
        // if unable to connect, terminate the application
        logger.error(
            `Error connecting to database using url: ${process.env.DATABASE_URL}`,
            {
                label: 'MongooseLoader',
            }
        );
        logger.error(err, { label: 'MongooseLoader' });
        logger.error('Unable to continue without a database, terminating!', {
            label: 'MongooseLoader',
        });
        process.exit(1);
    });

    logger.debug('Initialised mongoose');
};
