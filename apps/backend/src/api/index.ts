import { Router } from 'express';

import authRouter from './auth';

export default () => {
    const apiRouter = Router();

    // sub-routers
    apiRouter.use('/auth', authRouter());

    // secured routes
    // app.use('/route', passport.authenticate('jwt', { session: false }), router);

    return apiRouter;
};
