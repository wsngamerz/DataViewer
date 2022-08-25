import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

import { getLogger } from './logger';
import AuthService from '../services/auth';

export default async () => {
    // get local logger
    const logger = getLogger('PassportLoader');
    logger.debug('Initialising passport');

    // passport "register" local strategy
    passport.use(
        'register',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
            },
            async (username, password, done) => {
                logger.silly('Register local strategy', {
                    label: 'PassportLoader/registerLocalStrategy',
                });

                try {
                    const user = await AuthService.registerUser({
                        username,
                        password,
                    });
                    return done(null, user);
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    // passport "login" local strategy
    passport.use(
        'login',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
            },
            async (username, password, done) => {
                logger.silly('Login local strategy', {
                    label: 'PassportLoader/loginLocalStrategy',
                });

                try {
                    const user = await AuthService.login(username, password);
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    // passport jwt stragegy
    passport.use(
        new JWTStrategy(
            {
                secretOrKey: process.env.JWT_TOKEN,
                jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
            },
            async (token, done) => {
                logger.silly('JWT strategy', {
                    label: 'PassportLoader/JWTStrategy',
                });

                try {
                    return done(null, token.user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    logger.debug('Initialised passport');
};
