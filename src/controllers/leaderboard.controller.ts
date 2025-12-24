import { Request, Response } from 'express';
import { getLeaderboard, getUserRank, getCachedLeaderboard } from '../services/leaderboard.service';
import { LeaderboardPeriod } from '@prisma/client';

export const getLeaderboardController = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as LeaderboardPeriod) || LeaderboardPeriod.ALL_TIME;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const department = req.query.department as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const result = await getLeaderboard({ period, year, month, department, limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get leaderboard'
    });
  }
};

export const getUserRankController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const period = (req.query.period as LeaderboardPeriod) || LeaderboardPeriod.ALL_TIME;
    const result = await getUserRank(userId, period);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user rank'
    });
  }
};


