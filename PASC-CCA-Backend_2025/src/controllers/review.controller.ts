import { Request, Response } from 'express';
import {
  createEventReview,
  getEventReviews,
  getEventReviewStats,
  updateEventReview,
  deleteEventReview,
  getUserEventReview
} from '../services/review.service';

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create event review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - rating
 *             properties:
 *               eventId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *               contentRating:
 *                 type: integer
 *               speakerRating:
 *                 type: integer
 *               organizationRating:
 *                 type: integer
 *               anonymous:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Review created successfully
 *       400:
 *         description: Bad request
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const result = await createEventReview(userId, req.body);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create review'
    });
  }
};

/**
 * @swagger
 * /api/reviews/event/{eventId}:
 *   get:
 *     summary: Get event reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 */
export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const limit = parseInt(req.query.limit as string) || 50;

    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getEventReviews(eventId, limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get reviews'
    });
  }
};

/**
 * @swagger
 * /api/reviews/event/{eventId}/me:
 *   get:
 *     summary: Get current user's review for an event
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review retrieved successfully
 *       404:
 *         description: Review not found
 */
export const getUserReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getUserEventReview(userId, eventId);

    // If not found, meaningful response but 200 with success: false (or 404, but keeping style)
    if (!result.success) {
      res.status(200).json({ success: false, message: 'Review not found' });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user review'
    });
  }
};

/**
 * @swagger
 * /api/reviews/event/{eventId}/stats:
 *   get:
 *     summary: Get event review statistics
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review stats retrieved successfully
 */
export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const stats = await getEventReviewStats(eventId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get review stats'
    });
  }
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Update review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               review:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated successfully
 */
export const updateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ success: false, message: 'Invalid review ID' });
      return;
    }

    const result = await updateEventReview(userId, reviewId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update review'
    });
  }
};

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Delete review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Review deleted successfully
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const adminId = req.admin?.id;

    if (!userId && !adminId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ success: false, message: 'Invalid review ID' });
      return;
    }

    // If admin is deleting, pass 0 as userId (ignored) and true as isAdmin
    const result = await deleteEventReview(userId || 0, reviewId, !!adminId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete review'
    });
  }
};


