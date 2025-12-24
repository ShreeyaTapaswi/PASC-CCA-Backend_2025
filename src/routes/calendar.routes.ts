import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  downloadEventCalendar,
  downloadUserCalendar,
  downloadPublicCalendar,
  getCalendarLinks
} from '../controllers/calendar.controller';

const router = Router();

// Public routes
router.get('/public/download', downloadPublicCalendar);
router.get('/event/:eventId/download', downloadEventCalendar);
router.get('/event/:eventId/links', getCalendarLinks);

// User routes
router.get('/my-calendar/download', authenticateToken, requireUser, downloadUserCalendar);

export default router;


