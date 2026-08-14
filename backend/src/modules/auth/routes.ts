import { Router } from 'express';
import { authenticate } from '../../auth/middleware';
import {
  handleChangePassword,
  handleLogin,
  handleLogout,
  handleMe,
  handleRefresh,
} from './controllers';

const router = Router();

router.post('/login', handleLogin);
router.post('/refresh', handleRefresh);
router.post('/logout', handleLogout);
router.get('/me', authenticate, handleMe);
router.post('/change-password', authenticate, handleChangePassword);

export default router;