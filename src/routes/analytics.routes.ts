import { Router } from 'express';
import { authenticateToken, requireUser, requireAdmin } from '../middlewares/auth.middleware';
import {
  getAdminAnalyticsController,
  getUserAnalyticsController,
  getEventAnalyticsController
} from '../controllers/analytics.controller';

const router = Router();

// Admin routes
router.get('/admin', authenticateToken, requireAdmin, getAdminAnalyticsController);
router.get('/event/:eventId', authenticateToken, requireAdmin, getEventAnalyticsController);

// User routes
router.get('/user', authenticateToken, requireUser, getUserAnalyticsController);

export default router;


