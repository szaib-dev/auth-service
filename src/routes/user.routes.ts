import type { Router } from 'express';
import express from 'express';
import { createUser } from '../controller/user.js';
import RegisterUserValidaton from '../validator/user/creatingUserValidation.js';

const route: Router = express.Router();

route.post('/register', RegisterUserValidaton, createUser);

export default route;
