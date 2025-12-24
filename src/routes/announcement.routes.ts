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

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createAnnouncementController);
router.put('/:announcementId', authenticateToken, requireAdmin, updateAnnouncementController);
router.delete('/:announcementId', authenticateToken, requireAdmin, deleteAnnouncementController);
router.get('/all', authenticateToken, requireAdmin, getAllAnnouncementsController);

// User routes
router.get('/', authenticateToken, requireUser, getUserAnnouncementsController);
router.post('/:announcementId/read', authenticateToken, requireUser, markAnnouncementReadController);
router.get('/unread-count', authenticateToken, requireUser, getUnreadCountController);

export default router;


