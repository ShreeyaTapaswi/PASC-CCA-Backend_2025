import { Router } from 'express';
import {  authenticateToken, requireAdmin, requireUser } from '../middlewares/auth.middleware';
import { createEvent, getEventsForAdmin,getEvents, getEventById, updateEvent, deleteEvent , getEventsByStatus, getEventsOfUser } from '../controllers/event.controller';


const router = Router();

// Admin routes
router.post('/', authenticateToken, requireAdmin, createEvent);
router.put('/:id', authenticateToken, requireAdmin , updateEvent);
router.delete('/:id', authenticateToken, requireAdmin , deleteEvent);
router.get('/admin',authenticateToken , requireAdmin , getEventsForAdmin);

//User routes
router.get('/user' , authenticateToken , requireUser , getEventsOfUser);

// Public routes
router.get('/', getEvents);
router.get('/filter' , getEventsByStatus) ;
router.get('/:id', getEventById);







export default router; 