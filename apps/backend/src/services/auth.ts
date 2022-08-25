import bcrypt from 'bcrypt';

import { getLogger } from '../loaders/logger';
import User from '../models/user';

export default class AuthService {
    public static async registerUser(userDTO) {
        // get a logger
        const logger = getLogger();
        logger.silly('User being registered', {
            label: 'AuthService/registerUser',
        });

        // check if username exists in db
        const userExist = await User.find({ username: userDTO.username });
        if (userExist) {
            logger.warn(`User registration with existing username`, {
                label: 'AuthService/registerUser',
            });
            throw new Error('User already exists');
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(userDTO.password, 10);

        // create the user with the hashed password
        const user = await User.create({
            ...userDTO,
            password: hashedPassword,
        }).catch((error) => {
            logger.warn(`Error adding user to database: ${error}`, {
                label: 'AuthService/registerUser',
            });
        });

        return user;
    }

    public static async login(username, password) {
        const logger = getLogger();
        logger.silly(`User '${username}' logging in`, {
            label: 'AuthService/login',
        });
        // check if the user exists first
        const user = await User.findOne({ username });
        if (!user) {
            logger.warn(`User '${username}' doesn't exist`, {
                label: 'AuthService/login',
            });
            throw new Error('No user found with that username');
        }

        // verify valid password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn(
                `User '${username}' attempted login with incorrect password`,
                {
                    label: 'AuthService/login',
                }
            );
            throw new Error('Invalid password for user');
        }

        return user;
    }
}
