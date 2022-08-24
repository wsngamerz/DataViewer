import expressLoader from './express';
import mongooseLoader from './mongoose';
import { getLogger } from './logger';

export default async ({ expressApp }) => {
    // get local logger
    const logger = getLogger('Loader');
    logger.debug('Loading started');

    // initialise mongoose and connect to database
    const mongooseConnection = await mongooseLoader();

    // initialise express
    await expressLoader({ app: expressApp });

    // initialise agenda

    logger.debug('Loading finished');
};
