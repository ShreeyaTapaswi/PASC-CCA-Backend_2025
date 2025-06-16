import { Request, Response } from "express";
import {getRsvpsByEventId} from "../services/rsvp.service" ;


export const createRsvp = async (req: Request, res: Response) => {
  // Logic to create RSVP
  res.status(201).json({ message: "RSVP created successfully" });
}

export const getRsvpUser = async (req: Request, res: Response) => {
  // Logic to get RSVP for a user
  res.status(200).json({ message: "RSVP fetched successfully" });
}
/**
 * @swagger
 * /api/rsvps/event/{eventId}:
 *   get:
 *     summary: Get RSVPs for a specific event (Admin only)
 *     tags:
 *       - RSVPs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Successfully fetched RSVPs for event
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RsvpAndUserResponse'
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */

export const getRsvpForEvent = async (req: Request, res: Response) => {
  // Logic to get RSVP for an event
  try {
    const eventId = parseInt(req.params.eventId) ;

    if(isNaN(eventId)){
      return res.status(400).json({success:false , error:"invalide event ID"}) ;
    }

    const rsvps = await getRsvpsByEventId(eventId) ;

    return res.status(200).json({
      success : true ,
      data : rsvps ,
    }) ;
    }catch(error) {
      console.error("Error getting RSVPs :" , error) ;
      return res.status(500).json({success : false , error:"Internal server error"}) ;
    }
  //res.status(200).json({ message: "RSVP for event fetched successfully" });
};

export const updateRsvp = async (req: Request, res: Response) => {
  // Logic to update RSVP
  res.status(200).json({ message: "RSVP updated successfully" });
}

export const deleteRsvp = async (req: Request, res: Response) => {
  // Logic to delete RSVP
  res.status(200).json({ message: "RSVP deleted successfully" });
}