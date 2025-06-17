import { Router } from 'express';
import {  authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import { createEvent, getEventsForAdmin,getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/event.controller';

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createEvent);
router.put('/:id', authenticateToken, requireAdmin , updateEvent);
router.delete('/:id', authenticateToken, requireAdmin , deleteEvent);
router.get('/admin',authenticateToken , requireAdmin , getEventsForAdmin)

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

//User Routes



export default router; 