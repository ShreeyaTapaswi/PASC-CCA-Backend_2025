import { Router } from 'express';
import { authenticateToken, requireUser, requireAdmin } from '../middlewares/auth.middleware';
import { createRsvp, deleteRsvp, getRsvpByEventIdController, getRsvpForEvent, getRsvpUser, updateRsvp} from '../controllers/rsvp.controller';

const router = Router();

// User and Admin routes
router.post('/', authenticateToken, requireUser, createRsvp);
router.put('/:id', authenticateToken, requireUser, updateRsvp);
router.delete('/:id', authenticateToken, requireUser, deleteRsvp);
router.get('/user', authenticateToken, requireUser, getRsvpUser);
router.get('/events/:eventId/rsvp', authenticateToken, requireUser, getRsvpByEventIdController);
router.get('/event/:eventId', authenticateToken, requireAdmin, getRsvpForEvent);

export default router;