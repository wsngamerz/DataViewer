import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

export default () => {
    const authRouter = Router();

    // routes
    authRouter.post(
        '/register',
        passport.authenticate('register', { session: false }),
        register
    );

    authRouter.post('/login', login);

    return authRouter;
};

// register route
const register = (req, res) => res.json({ message: 'success', user: req.user });

// login route
const login = (req, res, next) => {
    passport.authenticate('login', async (err, user) => {
        try {
            if (err || !user) {
                return next(err || new Error('An error occurred '));
            }

            // login
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);

                // create a jwt token containing the username and the user id and sign it
                const body = { _id: user._id, username: user.username };
                const token = jwt.sign({ user: body }, process.env.JWT_TOKEN);

                // send the token to the user
                return res.json({ token });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
};
