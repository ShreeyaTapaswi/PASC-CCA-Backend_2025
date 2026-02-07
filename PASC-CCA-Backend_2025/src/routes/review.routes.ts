import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  createReview,
  getReviews,
  getReviewStats,
  updateReview,
  deleteReview,
  getUserReview
} from '../controllers/review.controller';
import { validate, reviewCreateSchema } from '../middlewares/validation.middleware';
import { createLimiter, apiLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// User routes with validation and rate limiting
router.post('/', authenticateToken, requireUser, createLimiter, validate(reviewCreateSchema), createReview);
router.put('/:reviewId', authenticateToken, requireUser, validate(reviewCreateSchema), updateReview);
router.delete('/:reviewId', authenticateToken, requireUser, deleteReview);

// Public routes with rate limiting
router.get('/event/:eventId/me', authenticateToken, requireUser, getUserReview);
router.get('/event/:eventId', apiLimiter, getReviews);
router.get('/event/:eventId/stats', apiLimiter, getReviewStats);

export default router;


