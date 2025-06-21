import { Router } from 'express';
import {  authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import { createAttendanceSession, toggleAttendanceSession, updateAttendanceSession } from '../controllers/attendance.controller';

const router = Router();


// Admin routes
router.post('/events/:eventId/sessions', authenticateToken, requireAdmin,createAttendanceSession);
router.put('/events/:eventId/sessions/:sessionId', authenticateToken, requireAdmin,toggleAttendanceSession);//toggle isActive
router.put('/events/:eventId/sessions/:sessionId', authenticateToken, requireAdmin,updateAttendanceSession);//update entire session
router.get('/events/:eventId/sessions/:sessionId', authenticateToken, requireAdmin,);//get the session for admin for the code
router.get('/sessions/:sessionId/stats' , authenticateToken, requireAdmin,);
router.get('/events/:eventId/attendance', authenticateToken, requireAdmin,);
router.get('/events/:eventId/sessions', authenticateToken, requireAdmin,);//get all sessions for an event

//User routes
// /events/:eventId/sessions/:sessionId/attend
router.post('/events/:eventId/sessions/:sessionId/attend', authenticateToken, requireUser,);



export default router; 