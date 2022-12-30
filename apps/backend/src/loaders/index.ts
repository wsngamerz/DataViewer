import Logger from '@data-viewer/shared/logger';
import expressLoader from './express';
import mongooseLoader from './mongoose';
import agendaLoader from './agenda';
import pluginLoader from './plugins';

export default async ({ expressApp }) => {
    // get local logger
    const logger = Logger.getLogger('Loaders');
    logger.debug('Loading started');

    // initialise key sections of the system
    await mongooseLoader();
    await expressLoader({ app: expressApp });
    await agendaLoader();
    await pluginLoader();

    logger.debug('Loading finished');
};
