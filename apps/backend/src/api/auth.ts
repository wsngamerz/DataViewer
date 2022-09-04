import { Router } from 'express';

import AuthService from '../services/auth';

export default () => {
    const authRouter = Router();

    // routes
    authRouter.post('/register', register);
    authRouter.post('/login', login);

    return authRouter;
};

// register route
const register = async (req, res) => {
    // get user info from the request body
    const { username, password } = req.body;

    // pass it though to the register authentication service
    const user = await AuthService.register(username, password).catch(
        (error: Error) => {
            res.status(401).json({
                message: 'User not registered',
                reason: error.message,
            });
        }
    );

    if (!user) return;
    res.json({ message: 'User successfully registered' });
};

// login route
const login = async (req, res) => {
    // get user info from request body
    const { username, password } = req.body;

    // pass it to the login authentication service
    const user = await AuthService.login(username, password).catch(
        (error: Error) => {
            res.status(401).json({
                message: 'Unable to Login',
                reason: error.message,
            });
        }
    );

    if (!user) return;

    // generate a token and return it for the user
    const token = await AuthService.generateJWT(
        user._id,
        user.username,
        user.role
    );

    res.json({
        message: 'User successfuly logged in',
        token,
    });
};
