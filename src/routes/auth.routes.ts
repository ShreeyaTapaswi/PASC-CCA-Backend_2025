import { Router } from 'express';
import {
  registerUser,
  loginUserController,
  logoutUserController,
  getCurrentUser,
  registerAdmin,
  loginAdminController,
  logoutAdminController,
  getCurrentAdmin,
} from '../controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// User routes
router.post('/user/register', registerUser);
router.post('/user/login', loginUserController);
router.post('/user/logout', authenticateToken, logoutUserController);
router.get('/user/me', authenticateToken, getCurrentUser);

// Admin routes
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdminController);
router.post('/admin/logout', authenticateToken, requireAdmin, logoutAdminController);
router.get('/admin/me', authenticateToken, requireAdmin, getCurrentAdmin);

export default router; 