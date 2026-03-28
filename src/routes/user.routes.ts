import type { Router } from 'express';
import express from 'express';
import { createUser } from '../controller/user.js';

const route: Router = express.Router();

route.post('/register', createUser);

export default route;
