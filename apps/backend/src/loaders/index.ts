import expressLoader from './express';
import mongooseLoader from './mongoose';
import agendaLoader from './agenda';
import passportLoader from './passport';
import { getLogger } from './logger';

export default async ({ expressApp }) => {
    // get local logger
    const logger = getLogger('Loader');
    logger.debug('Loading started');

    // initialise key sections of the system
    await mongooseLoader();
    await passportLoader();
    await expressLoader({ app: expressApp });
    await agendaLoader();

    logger.debug('Loading finished');
};
