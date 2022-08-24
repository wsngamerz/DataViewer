import { Agenda } from 'agenda';
import mongoose from 'mongoose';

import { getLogger } from './logger';

export default async () => {
    // get local logger
    const logger = getLogger('AgendaLoader');
    logger.debug('Initialising agenda');

    // load agenda and connect to mongodb using existing connection
    const agenda = new Agenda();
    agenda.mongo(mongoose.connection.db, 'agenda');

    // register jobs
    // ...

    // add event handlers
    agenda.on('success', (job) => {
        logger.debug(`Job ${job.attrs.name} Complete`, { label: 'AgendaJob' });
    });

    agenda.on('fail', (err, job) => {
        logger.error(
            `Job ${job.attrs.name} failed with error: ${err.message}`,
            { label: 'AgendaJob' }
        );
        logger.error(`${err.stack}`, { label: 'AgendaJob' });
    });

    // start the job processor
    await agenda.start();
    logger.debug('Initialised agenda');
};
