import Logger from '../logger';
import expressLoader from './express';
import mongooseLoader from './mongoose';
import agendaLoader from './agenda';

export default async ({ expressApp }) => {
    // get local logger
    const logger = new Logger('Loaders');
    logger.debug('Loading started');

    // initialise key sections of the system
    await mongooseLoader();
    await expressLoader({ app: expressApp });
    await agendaLoader();

    logger.debug('Loading finished');
};
