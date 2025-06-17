import { PrismaClient } from "@prisma/client";

import { Request, Response } from "express";

import {
  postrsvp,
  getUserRsvps,
  findRsvpByEventId,
  getRsvpsByEventId,
  getRsvpByEventId as getRsvpByEventIdService,
  deleteRsvpById,
  UpdateRsvp,
} from "../services/rsvp.service";


const prisma = new PrismaClient();
console.log("findRsvpByEventId is:", findRsvpByEventId); // should NOT be undefined

/**
 * @swagger
 * /api/rsvps:
 *   post:
 *     summary: Create a new RSVP
 *     tags: [RSVP]
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
 *               - status
 *
 *             properties:
 *               eventId:
 *                 type: integer
 *                 example: 101
 *               status:
 *                 type: string
 *                 enum: [ "ATTENDING", "NOT_ATTENDING"]
 *                 example: ATTENDING
 *
 *     responses:
 *       201:
 *         description: RSVP created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RsvpResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export const createRsvp = async (req: Request, res: Response) => {
  try {
    //  const { eventId, status,userId } = req.body;
    // const userId = req.userId;
    const eventId = req.body.eventId;
    const status = req.body.status;
    const userId = req.user!.id;

    const rsvpData = {
      eventId,
      status,
    };

    const result = await postrsvp(rsvpData, userId);

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};

/**
 * @swagger
 * /api/rsvps/user:
 *   get:
 *     tags:
 *       - RSVP
 *     summary: Get all RSVPs for the authenticated user
 *     responses:
 *       200:
 *         description: Returns all RSVPs for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       eventId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       event:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           date:
 *                             type: string
 *                           location:
 *                             type: string
 *                           capacity:
 *                             type: number
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
export const getRsvpUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id; // Get from authenticated user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await getUserRsvps(userId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};
/**
 * @swagger
 * /api/rsvps/event/{eventId}:
 *   get:
 *     tags:
 *       - RSVP
 *     summary: Get all RSVPs for a specific event (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Returns all RSVPs for the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       eventId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */

export const getRsvpForEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const result = await getRsvpsByEventId(eventId);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "No RSVPs found for this event" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error getting RSVPs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};

/**
 * @swagger
 * /events/{eventId}/rsvp:
 *   get:
 *     summary: Get RSVP details for a specific event (User only)
 *     tags: [RSVP]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to fetch RSVP for
 *     responses:
 *       200:
 *         description: RSVP data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     eventId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [ATTENDING, NOT_ATTENDING]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     event:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date-time
 *                         location:
 *                           type: string
 *                         capacity:
 *                           type: integer
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: RSVP not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

export const getRsvpByEventIdController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const result = await getRsvpByEventIdService(eventId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};

/**
 * @swagger
 * /api/rsvps/{id}:
 *   put:
 *     tags:
 *       - RSVP
 *     summary: Update RSVP status for a specific event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event to update RSVP for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ATTENDING, NOT_ATTENDING]
 *     responses:
 *       200:
 *         description: RSVP updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     eventId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: RSVP not found
 *       500:
 *         description: Internal server error
 */

export const updateRsvp = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const status = req.body.status;
    console.log(eventId);

    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const result = await UpdateRsvp(eventId, status);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};

/**
 * @swagger
 * /api/rsvps/{id}:
 *   delete:
 *     tags:
 *       - RSVP
 *     summary: Delete an RSVP by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the RSVP to delete
 *     responses:
 *       200:
 *         description: RSVP deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: RSVP deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     eventId:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [ATTENDING, NOT_ATTENDING]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid RSVP ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid RSVP ID
 *       404:
 *         description: RSVP not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: RSVP not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 *                 error:
 *                   type: string
 */

export const deleteRsvp = async (req: Request, res: Response) => {
  try {
    const rsvpId = parseInt(req.params.id);
    if (isNaN(rsvpId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid RSVP ID" });
    }

    const result = await deleteRsvpById(rsvpId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting RSVP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};
