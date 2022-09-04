import { Router } from 'express';

import authRouter from './auth';

export default () => {
    const apiRouter = Router();

    // sub-routers
    apiRouter.use('/auth', authRouter());

    return apiRouter;
};
