import { Router } from 'express';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller';

const router = Router();

// Admin routes
router.post('/', authenticateAdmin, createEvent);
router.put('/:id', authenticateAdmin, updateEvent);
router.delete('/:id', authenticateAdmin, deleteEvent);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

export default router; 