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
  getUserCountController
} from '../controllers/auth.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';
import { validate, userRegisterSchema, adminRegisterSchema, loginSchema } from '../middlewares/validation.middleware';
import { authLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// User routes with validation and rate limiting
router.post('/user/register', authLimiter, validate(userRegisterSchema), registerUser);
router.post('/user/login', authLimiter, validate(loginSchema), loginUserController);
router.post('/user/logout', authenticateToken, logoutUserController);
router.get('/user/me', authenticateToken, getCurrentUser);

// Admin routes with validation and rate limiting
router.post('/admin/register', authLimiter, validate(adminRegisterSchema), registerAdmin);
router.post('/admin/login', authLimiter, validate(loginSchema), loginAdminController);
router.post('/admin/logout', authenticateToken, requireAdmin, logoutAdminController);
router.get('/admin/me', authenticateToken, requireAdmin, getCurrentAdmin);

// Add user count route for admin
router.get('/user/count', authenticateToken, requireAdmin, getUserCountController);

export default router; 