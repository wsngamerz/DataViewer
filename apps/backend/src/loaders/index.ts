import expressLoader from './express';
import mongooseLoader from './mongoose';
import agendaLoader from './agenda';
import { getLogger } from './logger';

export default async ({ expressApp }) => {
    // get local logger
    const logger = getLogger('Loader');
    logger.debug('Loading started');

    // initialise mongoose and connect to database
    await mongooseLoader();

    // initialise express
    await expressLoader({ app: expressApp });

    // initialise agenda
    await agendaLoader();

    logger.debug('Loading finished');
};
