import { Router } from 'express';
import { authenticateToken, requireUser, requireAdmin } from '../middlewares/auth.middleware';
import { createRsvp, deleteRsvp, getRsvpByEventIdController, getRsvpForEvent, getRsvpUser, updateRsvp} from '../controllers/rsvp.controller';
import { validate, rsvpCreateSchema } from '../middlewares/validation.middleware';
import { createLimiter, apiLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// User and Admin routes with validation and rate limiting
router.post('/', authenticateToken, requireUser, createLimiter, validate(rsvpCreateSchema), createRsvp);
router.put('/:id', authenticateToken, requireUser, updateRsvp);
router.delete('/:id', authenticateToken, requireUser, deleteRsvp);
router.get('/user', authenticateToken, requireUser, apiLimiter, getRsvpUser);
router.get('/events/:eventId/rsvp', authenticateToken, requireUser, apiLimiter, getRsvpByEventIdController);
router.get('/event/:eventId', authenticateToken, requireAdmin, apiLimiter, getRsvpForEvent);

export default router;