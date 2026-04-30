import type { Router } from 'express';
import express from 'express';
import { createTenant } from '../controller/tenant.js';
import authentication from '../middleware/authentication.js';
import WhoCanAccess from '../services/WhoCanAccess.js';
import { UserRole } from '../generated/prisma/enums.js';

const route: Router = express.Router();

route.post('/create',authentication, WhoCanAccess([UserRole.ADMIN]), createTenant);


export default route;
