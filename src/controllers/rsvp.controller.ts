import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();




export const createRsvp = async (req: Request, res: Response) => {
  // Logic to create RSVP
  res.status(201).json({ message: "RSVP created successfully" });
}

/**
 * @swagger
 * /api/rsvp/user:
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
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const rsvps = await prisma.rsvp.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            location: true,
            capacity: true,
          },
        },
      },
    });

    const response = rsvps.map((rsvp) => ({
      id: rsvp.id.toString(),
      userId: rsvp.userId.toString(),
      eventId: rsvp.eventId.toString(),
      status: rsvp.status,
      createdAt: rsvp.createdAt.toISOString(),
      updatedAt: rsvp.createdAt.toISOString(), // Using createdAt since updatedAt doesn't exist
      event: {
        id: rsvp.event.id.toString(),
        title: rsvp.event.title,
        description: rsvp.event.description,
        date: rsvp.event.startDate.toISOString(),
        location: rsvp.event.location,
        capacity: rsvp.event.capacity
      },
    }));

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching user RSVPs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @swagger
 * /api/rsvp/event/{eventId}:
 *   get:
 *     tags:
 *       - RSVP
 *     summary: Get RSVP for a specific event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Returns the RSVP for the specified event
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
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: RSVP not found for this event
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

    const rsvp = await prisma.rsvp.findFirst({
      where: {
        eventId,
      },
    });

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP not found for this event",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: rsvp.id.toString(),
        userId: rsvp.userId.toString(),
        eventId: rsvp.eventId.toString(),
        status: rsvp.status,
        createdAt: rsvp.createdAt.toISOString(),
        updatedAt: rsvp.createdAt.toISOString() // Using createdAt since updatedAt doesn't exist
      },
    });
  } catch (error) {
    console.error("Error fetching RSVP for event:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateRsvp = async (req: Request, res: Response) => {
  // Logic to update RSVP
  res.status(200).json({ message: "RSVP updated successfully" });
}

export const deleteRsvp = async (req: Request, res: Response) => {
  // Logic to delete RSVP
  res.status(200).json({ message: "RSVP deleted successfully" });
}