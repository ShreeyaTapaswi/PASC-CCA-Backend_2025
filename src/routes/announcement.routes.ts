import { Router } from 'express';
import { authenticateToken, requireUser, requireAdmin } from '../middlewares/auth.middleware';
import {
  createAnnouncementController,
  getUserAnnouncementsController,
  getAllAnnouncementsController,
  markAnnouncementReadController,
  updateAnnouncementController,
  deleteAnnouncementController,
  getUnreadCountController
} from '../controllers/announcement.controller';
import { apiLimiter, createLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Admin routes — createLimiter on write ops, apiLimiter on reads
router.post('/', authenticateToken, requireAdmin, createLimiter, createAnnouncementController);
router.put('/:announcementId', authenticateToken, requireAdmin, apiLimiter, updateAnnouncementController);
router.delete('/:announcementId', authenticateToken, requireAdmin, apiLimiter, deleteAnnouncementController);
router.get('/all', authenticateToken, requireAdmin, apiLimiter, getAllAnnouncementsController);

// User routes
router.get('/', authenticateToken, requireUser, apiLimiter, getUserAnnouncementsController);
router.post('/:announcementId/read', authenticateToken, requireUser, apiLimiter, markAnnouncementReadController);
router.get('/unread-count', authenticateToken, requireUser, apiLimiter, getUnreadCountController);

export default router;
