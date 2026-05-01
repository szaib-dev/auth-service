import type { Router } from 'express';
import express from 'express';
import { createTenant, tenantsList } from '../controller/tenant.js';
import authentication from '../middleware/authentication.js';
import WhoCanAccess from '../services/WhoCanAccess.js';
import { UserRole } from '../generated/prisma/enums.js';

const route: Router = express.Router();

route.post('/create', authentication, WhoCanAccess([UserRole.ADMIN]), createTenant);
route.get('/list', authentication, WhoCanAccess([UserRole.ADMIN]), tenantsList )

export default route;
