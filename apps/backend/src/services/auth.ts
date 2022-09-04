import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Logger from '../logger';
import User from '../models/user';

export default class AuthService {
    /**
     * Register a new user
     *
     * @static
     * @param {string} username
     * @param {string} password
     * @return {*} user object if successful register
     * @throws {Error} error thrown if unsuccessful
     * @memberof AuthService
     */
    public static async register(username: string, password: string) {
        // get a logger
        const logger = new Logger('AuthService/register');
        logger.silly('User being registered');

        // check if username exists in db
        const userExist = await User.findOne({ username });
        if (userExist) {
            logger.warn(
                `User registration with existing username: ${username}`
            );
            logger.silly(JSON.stringify(userExist));
            throw new Error('User already exists');
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user with the hashed password
        const user = await User.create({
            username,
            password: hashedPassword,
        }).catch((error) => {
            logger.warn(`Error adding user to database: ${error}`);
        });

        if (!user) return;
        logger.silly('User Registered');

        return user;
    }

    /**
     * Login
     *
     * @static
     * @param {string} username
     * @param {string} password
     * @return {*} user object if successful login
     * @throws {Error} error thrown if unsuccessful
     * @memberof AuthService
     */
    public static async login(username: string, password: string) {
        const logger = new Logger('AuthService/login');
        logger.silly(`User '${username}' logging in`);
        // check if the user exists first
        const user = await User.findOne({ username });
        if (!user) {
            logger.warn(`User '${username}' doesn't exist`);
            throw new Error('No user found with that username');
        }

        // verify valid password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn(
                `User '${username}' attempted login with incorrect password`
            );
            throw new Error('Invalid password for user');
        }

        return user;
    }

    public static async generateJWT(id, username, role) {
        const logger = new Logger('AuthService/generateJWT');
        logger.silly(`Generating JWT for ${username}`);

        const tokenPayload = { id, username, role };
        const maxAge = 3 * 60 * 60; // 3 hours (in seconds)

        // create a JWT using the server secret and expiring in a defined length of time
        const token = jwt.sign(tokenPayload, process.env.JWT_TOKEN, {
            expiresIn: maxAge,
        });

        return token;
    }
}
