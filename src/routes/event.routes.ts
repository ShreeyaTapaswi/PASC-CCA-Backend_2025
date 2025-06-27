import { Router } from 'express';
import {  authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import { createEvent, getEventsForAdmin,getEvents, getEventById, updateEvent, deleteEvent , getEventsByStatus } from '../controllers/event.controller';
import { get } from 'http';

const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createEvent);
router.put('/:id', authenticateToken, requireAdmin , updateEvent);
router.delete('/:id', authenticateToken, requireAdmin , deleteEvent);
router.get('/admin',authenticateToken , requireAdmin , getEventsForAdmin)

// Public routes
router.get('/', getEvents);
router.get('/filter' , getEventsByStatus) ;
router.get('/:id', getEventById);




export default router; 