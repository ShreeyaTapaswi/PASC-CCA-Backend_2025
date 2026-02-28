import { Router } from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import { createEvent, getEventsForAdmin, getEvents, getEventById, updateEvent, deleteEvent, getEventsByStatus, getEventsOfUser } from '../controllers/event.controller';
import { validate, eventCreateSchema } from '../middlewares/validation.middleware';
import { createLimiter, apiLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Admin routes with validation and rate limiting
router.post('/', authenticateToken, requireAdmin, createLimiter, validate(eventCreateSchema), createEvent);
router.put('/:id', authenticateToken, requireAdmin, apiLimiter, validate(eventCreateSchema), updateEvent);
router.delete('/:id', authenticateToken, requireAdmin, apiLimiter, deleteEvent);
router.get('/admin', apiLimiter, getEventsForAdmin);

//User routes
router.get('/user', authenticateToken, requireUser, apiLimiter, getEventsOfUser);

// Public routes with general rate limiting
router.get('/', apiLimiter, getEvents);
router.get('/filter', apiLimiter, getEventsByStatus);
router.get('/:id', apiLimiter, getEventById);

export default router; 