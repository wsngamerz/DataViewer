import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

import Logger from '../logger';
import User from '../models/User';

export default class AuthService {
    /**
     * Register a new user
     *
     * @static
     * @param {string} userDTO user data transfer object
     * @return {*} user object if successful register
     * @throws {Error} error thrown if unsuccessful
     * @memberof AuthService
     */
    public static async register(userDTO) {
        // get a logger
        const logger = new Logger('AuthService/register');
        logger.silly('User being registered');

        // validate the input
        let userValid = false;
        let issues = [];
        try {
            userValid = this.validateUserDTO(userDTO);
        } catch (error) {
            logger.warn('User failed validation');
            issues = error.details.map((d) => d.message);
            logger.silly(`Rules failed:\n${issues.join('\n')}`);
        }

        // if invalid, return an error with the failed rules
        if (!userValid)
            throw new Error(`User validation failed: ${issues.join(', ')}`);

        // check if username exists in db
        const userExist = await User.findOne({ username: userDTO.username });
        if (userExist) {
            logger.warn(
                `User registration with existing username: ${userDTO.username}`
            );
            logger.silly(JSON.stringify(userExist));
            throw new Error('User already exists');
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(userDTO.password, 10);

        // create the user with the hashed password
        const user = await User.create({
            username: userDTO.username,
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

        // token content
        const tokenPayload = { id, username, role };
        const maxAge = 3 * 60 * 60; // 3 hours (in seconds)

        // create a JWT using the server secret and expiring in a defined length of time
        const token = jwt.sign(tokenPayload, process.env.JWT_TOKEN, {
            expiresIn: maxAge,
        });

        return token;
    }

    public static validateUserDTO(userDTO: {
        username: string;
        password: string;
    }) {
        const userSchema = Joi.object().keys({
            first_name: Joi.string().required(),
            last_name: Joi.string().required(),
            email: Joi.string().email(),
            username: Joi.string().alphanum().min(3).max(32).required(),
            password: Joi.string().min(8).max(64).required(),
            password_confirmation: Joi.string()
                .valid(Joi.ref('password'))
                .required(),
        });

        const { error } = userSchema.validate(userDTO, {
            abortEarly: false,
        });

        if (error) {
            throw error;
        } else return true;
    }
}
