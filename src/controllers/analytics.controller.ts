import { handleError } from "../utils/errorHandler";
import { Request, Response } from 'express';
import { getAdminAnalytics, getUserAnalytics, getEventAnalytics } from '../services/analytics.service';
import fs from 'fs';
import path from 'path';

export const getAdminAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getAdminAnalytics();
    res.status(200).json(result);
  } catch (error) {
    const logMessage = `[${new Date().toISOString()}] Admin Analytics Error: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'N/A'}\n\n`;
    fs.appendFileSync(path.join(process.cwd(), 'debug_analytics.log'), logMessage);

    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get analytics')
    });
  }
};

export const getUserAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await getUserAnalytics(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get user analytics')
    });
  }
};

export const getEventAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getEventAnalytics(eventId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get event analytics')
    });
  }
};


