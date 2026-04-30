import type { Router } from 'express';
import express from 'express';
import {
    createUser,
    loginUser,
    logoutUser,
    refreshTokens,
    VerifyMyself,
} from '../controller/user.js';
import RegisterUserValidaton from '../validator/user/register-user.js';
import LoginUserValidaton from '../validator/user/login-user.js';
import authentication from '../middleware/authentication.js';
import tokenValidation from '../middleware/tokenValidation.js';
import tokenValidationLogout from '../middleware/parseRefreshToken.js';

const route: Router = express.Router();

route.post('/register', RegisterUserValidaton, createUser);
route.post('/login', LoginUserValidaton, loginUser);
route.get('/self', authentication, VerifyMyself);
route.post('/refresh-tokens', tokenValidation, refreshTokens);
route.post('/logout', authentication, tokenValidationLogout, logoutUser);

export default route;
