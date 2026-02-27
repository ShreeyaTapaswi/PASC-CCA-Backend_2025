import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  getLeaderboardController,
  getUserRankController,
  getMyDivisionInfoController
} from '../controllers/leaderboard.controller';
import { apiLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Public routes — apiLimiter to prevent scraping
router.get('/', apiLimiter, getLeaderboardController);

// User routes
router.get('/my-rank', authenticateToken, requireUser, apiLimiter, getUserRankController);
router.get('/my-division', authenticateToken, requireUser, apiLimiter, getMyDivisionInfoController);

export default router;
