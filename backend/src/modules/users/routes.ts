import { Router } from 'express';
import { authenticate, authorize } from '../../auth/middleware';
import * as ctrl from './controllers';

const router = Router();

router.use(authenticate);

router.get('/', authorize('users.read'), ctrl.list);
router.post('/', authorize('users.create'), ctrl.create);
router.get('/:id', authorize('users.read'), ctrl.get);
router.patch('/:id', authorize('users.update'), ctrl.requireSelfOrSuperAdmin, ctrl.update);
router.patch('/:id/status', authorize('users.update'), ctrl.setStatus);
router.post('/:id/reset-password', authorize('users.update'), ctrl.resetPassword);

export default router;