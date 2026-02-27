import { Router } from 'express';
import { authenticateToken, requireUser } from '../middlewares/auth.middleware';
import {
  getLeaderboardController,
  getUserRankController,
  getMyDivisionInfoController
} from '../controllers/leaderboard.controller';

const router = Router();

// Public routes
router.get('/', getLeaderboardController);

// User routes
router.get('/my-rank', authenticateToken, requireUser, getUserRankController);
router.get('/my-division', authenticateToken, requireUser, getMyDivisionInfoController);

export default router;


