import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  getNotifications,
  markNotificationRead,
  markAllRead,
  getUnreadCount
} from '../controllers/notification.controller';

const router = Router();

// User routes
router.get('/', authenticateToken, requireUser, getNotifications);
router.post('/:notificationId/read', authenticateToken, requireUser, markNotificationRead);
router.post('/mark-all-read', authenticateToken, requireUser, markAllRead);
router.get('/unread-count', authenticateToken, requireUser, getUnreadCount);

export default router;


