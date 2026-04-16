import { handleError } from "../utils/errorHandler";
import { Request, Response } from 'express';
import {
  createAnnouncement,
  getUserAnnouncements,
  getAllAnnouncements,
  markAnnouncementAsRead,
  updateAnnouncement,
  deleteAnnouncement,
  getUnreadAnnouncementCount
} from '../services/announcement.service';

export const createAnnouncementController = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      res.status(401).json({ success: false, message: 'Admin not authenticated' });
      return;
    }

    const result = await createAnnouncement(adminId, req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to create announcement')
    });
  }
};

export const getUserAnnouncementsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const includeRead = req.query.includeRead === 'true';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const result = await getUserAnnouncements(userId, includeRead, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get announcements')
    });
  }
};

export const getAllAnnouncementsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const result = await getAllAnnouncements(limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get announcements')
    });
  }
};

export const markAnnouncementReadController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const announcementId = parseInt(req.params.announcementId);
    if (isNaN(announcementId)) {
      res.status(400).json({ success: false, message: 'Invalid announcement ID' });
      return;
    }

    const result = await markAnnouncementAsRead(userId, announcementId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to mark announcement as read')
    });
  }
};

export const updateAnnouncementController = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = parseInt(req.params.announcementId);
    if (isNaN(announcementId)) {
      res.status(400).json({ success: false, message: 'Invalid announcement ID' });
      return;
    }

    const result = await updateAnnouncement(announcementId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to update announcement')
    });
  }
};

export const deleteAnnouncementController = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcementId = parseInt(req.params.announcementId);
    if (isNaN(announcementId)) {
      res.status(400).json({ success: false, message: 'Invalid announcement ID' });
      return;
    }

    const result = await deleteAnnouncement(announcementId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to delete announcement')
    });
  }
};

export const getUnreadCountController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const count = await getUnreadAnnouncementCount(userId);
    res.status(200).json({ success: true, data: { unreadCount: count } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get unread count')
    });
  }
};


