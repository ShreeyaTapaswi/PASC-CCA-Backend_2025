import { handleError } from "../utils/errorHandler";
import { Request, Response } from 'express';
import {
  addEventGalleryImage,
  getEventGallery,
  updateEventGalleryImage,
  deleteEventGalleryImage,
  getAllGalleryImages
} from '../services/gallery.service';

export const addGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await addEventGalleryImage(req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to add image')
    });
  }
};

export const getGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getEventGallery(eventId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get gallery')
    });
  }
};

export const getAllGallery = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await getAllGalleryImages(limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get gallery')
    });
  }
};

export const updateGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId);
    if (isNaN(imageId)) {
      res.status(400).json({ success: false, message: 'Invalid image ID' });
      return;
    }

    const result = await updateEventGalleryImage(imageId, req.body.caption);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to update image')
    });
  }
};

export const deleteGalleryImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageId = parseInt(req.params.imageId);
    if (isNaN(imageId)) {
      res.status(400).json({ success: false, message: 'Invalid image ID' });
      return;
    }

    const result = await deleteEventGalleryImage(imageId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to delete image')
    });
  }
};


