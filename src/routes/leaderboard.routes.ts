import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  getLeaderboardController,
  getUserRankController
} from '../controllers/leaderboard.controller';

const router = Router();

// Public routes
router.get('/', getLeaderboardController);

// User routes
router.get('/my-rank', authenticateToken, requireUser, getUserRankController);

export default router;


