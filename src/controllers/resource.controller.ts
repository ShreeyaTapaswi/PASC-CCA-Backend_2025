import { handleError } from "../utils/errorHandler";
import { Request, Response } from 'express';
import {
  createEventResource,
  getEventResources,
  updateEventResource,
  deleteEventResource
} from '../services/resource.service';

export const createResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await createEventResource(req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to create resource')
    });
  }
};

export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getEventResources(eventId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to get resources')
    });
  }
};

export const updateResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceId = parseInt(req.params.resourceId);
    if (isNaN(resourceId)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const result = await updateEventResource(resourceId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to update resource')
    });
  }
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceId = parseInt(req.params.resourceId);
    if (isNaN(resourceId)) {
      res.status(400).json({ success: false, message: 'Invalid resource ID' });
      return;
    }

    const result = await deleteEventResource(resourceId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to delete resource')
    });
  }
};


