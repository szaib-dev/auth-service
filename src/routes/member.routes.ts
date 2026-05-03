import type { Router } from 'express';
import express from 'express';
import WhoCanAccess from '../services/WhoCanAccess.js';
import { UserRole } from '../generated/prisma/enums.js';
import authentication from '../middleware/authentication.js';
import {
    createMember,
    deleteMemberById,
    getMemberById,
    listOfMembers,
    updateMemberById,
} from '../controller/member.js';

const route: Router = express.Router();

route.post(
    '/create',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    createMember
);
route.delete(
    '/delete/:memberId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    deleteMemberById
);
route.get(
    '/list',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    listOfMembers
);
route.patch(
    '/update/:memberId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    updateMemberById
);
route.get(
    '/:memberId',
    authentication,
    WhoCanAccess([UserRole.ADMIN]),
    getMemberById
);

export default route;
