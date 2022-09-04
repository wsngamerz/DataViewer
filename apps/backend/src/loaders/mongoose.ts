import mongoose from 'mongoose';

import Logger from '../logger';

export default async () => {
    // get local logger
    const logger = new Logger('MongooseLoader');
    logger.debug('Initialising mongoose');

    // connect to database
    await mongoose
        .connect(process.env.DATABASE_URL, {})
        .catch((error: Error) => {
            // if unable to connect, terminate the application
            logger.error(
                `Error connecting to database using url: ${process.env.DATABASE_URL}`
            );
            logger.error(error.message);
            logger.error('Unable to continue without a database, terminating!');
            process.exit(1);
        });

    logger.debug('Initialised mongoose');
};
