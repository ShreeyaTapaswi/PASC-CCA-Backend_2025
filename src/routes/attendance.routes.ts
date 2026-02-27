import { Router } from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import {
  createAttendanceSession,
  //   toggleAttendanceSession,
  updateAttendanceSession,
  getAttendanceSessionStats,
  //   getAttendanceSession,
  markAttendanceForSession,
  getUserAttendanceSessionStats,
  getUserStats,
  getSessionsByEventId,
  getSessionsForUserByEventId,
  exportAttendanceSessionsToExcel,
} from '../controllers/attendance.controller';
import { apiLimiter, createLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Admin routes — createLimiter on session creation, apiLimiter on reads/updates
router.post('/events/:eventId/sessions', authenticateToken, requireAdmin, createLimiter, createAttendanceSession);
// router.put('/events/:eventId/sessions/:sessionId', authenticateToken, requireAdmin, apiLimiter, toggleAttendanceSession); // toggle isActive
router.put('/events/sessions/:sessionId', authenticateToken, requireAdmin, apiLimiter, updateAttendanceSession); // update entire session
// router.get('/events/:eventId/sessions/:sessionId', authenticateToken, requireAdmin, apiLimiter, getAttendanceSession);
router.get('/sessions/:sessionId/stats', authenticateToken, requireAdmin, apiLimiter, getAttendanceSessionStats);
router.get('/events/:eventId/attendance', authenticateToken, requireAdmin, apiLimiter);
router.get('/events/:eventId/sessions', authenticateToken, requireAdmin, apiLimiter, getSessionsByEventId); // get all sessions for an event
router.get('/events/:eventId/sessions/export', authenticateToken, requireAdmin, apiLimiter, exportAttendanceSessionsToExcel); // export all sessions for an event

// User routes
// /events/:eventId/sessions/:sessionId/attend
router.post('/events/:eventId/sessions/:sessionId/attend', authenticateToken, requireUser, createLimiter, markAttendanceForSession);
router.get('/events/:eventId/sessions/attendance', authenticateToken, requireUser, apiLimiter, getUserAttendanceSessionStats); // get all sessions for an event
router.get('/user-attendance-stats', authenticateToken, requireUser, apiLimiter, getUserStats);
router.get('/user/events/:eventId/sessions', authenticateToken, requireUser, apiLimiter, getSessionsForUserByEventId);

export default router;