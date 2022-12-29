import { Agenda } from 'agenda';
import mongoose from 'mongoose';

import Logger from '../logger';

export default async () => {
    // get local logger
    const logger = Logger.getLogger('AgendaLoader');
    const jobLogger = Logger.getLogger('AgendaJob');
    logger.debug('Initialising agenda');

    // load agenda and connect to mongodb using existing connection
    const agenda = new Agenda();
    agenda.mongo(mongoose.connection.db, 'agenda');

    // register jobs
    // ...

    // add event handlers
    agenda.on('success', (job) => {
        jobLogger.debug(`Job ${job.attrs.name} Complete`);
    });

    agenda.on('fail', (err, job) => {
        jobLogger.error(`Job ${job.attrs.name} failed. Error: ${err.message}`);
        jobLogger.error(`${err.stack}`);
    });

    // start the job processor
    await agenda.start();
    logger.debug('Initialised agenda');
};
