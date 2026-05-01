import type { Router } from 'express';
import express from 'express';
import {
    createTenant,
    deleteTenant,
    findTenant,
    tenantsList,
    updateTenant,
} from '../controller/tenant.js';
import authentication from '../middleware/authentication.js';
import WhoCanAccess from '../services/WhoCanAccess.js';
import { UserRole } from '../generated/prisma/enums.js';
import tenantUpdateValidation from '../validator/tenant/update-tenant.js';
import tenantRegisterValidation from '../validator/tenant/create-tenant.js';

const route: Router = express.Router();

route.post(
    '/create',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    tenantRegisterValidation,
    createTenant
);
route.get('/list', authentication, WhoCanAccess([UserRole.ADMIN]), tenantsList);
route.patch(
    '/update/:tenantId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    tenantUpdateValidation,
    updateTenant
);
route.delete(
    '/delete/:tenantId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    deleteTenant
);
route.get(
    '/find/:tenantId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    findTenant
);

export default route;
