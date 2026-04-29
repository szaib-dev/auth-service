import type { Router } from 'express';
import express from 'express';
import { createUser, loginUser, VerifyMyself } from '../controller/user.js';
import RegisterUserValidaton from '../validator/user/register-user.js';
import LoginUserValidaton from '../validator/user/login-user.js';
import authentication from '../middleware/authentication.js';

const route: Router = express.Router();

route.post('/register', RegisterUserValidaton, createUser);
route.post('/loginroute', LoginUserValidaton, loginUser);
route.get('/self', authentication, VerifyMyself);

export default route;
