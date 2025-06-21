import { AttendanceSession } from '@prisma/client';
import { Request, Response } from 'express';
import { AttendanceResponse, AttendanceSessionResponse } from '../types/attendance.types';
import { createSessionService ,updateSessionService} from '../services/attendance.service'; 



/**
 * @swagger
 *  /api/attendance/events/{eventId}/sessions:
 *   post:
 *     summary: Create a new attendance session for an event
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: eventId
 *         in: path
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionName
 *               - location
 *               - startTime
 *             properties:
 *               sessionName:
 *                 type: string
 *                 example: "Morning Session"
 *               location:
 *                 type: string
 *                 example: "Hall A"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-22T09:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-06-22T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Attendance session created successfully
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
 *                   example: attendance session created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: integer
 *                       example: 12
 *                     sessionName:
 *                       type: string
 *                       example: "Morning Session"
 *                     code:
 *                       type: string
 *                       example: "a1b2c3d4"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-22T09:00:00.000Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2025-06-22T10:00:00.000Z"
 *                     location:
 *                       type: string
 *                       example: "Hall A"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid data or active session already exists
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

export const createAttendanceSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    const sessionData = req.body;
     if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }
    
    const result = await createSessionService(eventId, sessionData);

   res.status(201).json(result);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create attendance session',
    });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////updateAttendanceSession
/**
 * @swagger
 *  /api/attendance/events/sessions/{sessionId}':
 *   put:
 *     summary: Update an existing attendance session for an event
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         description: ID of the session
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionName
 *               - location
 *               - startTime
 *               - endTime
 *             properties:
 *               sessionName:
 *                 type: string
 *                 example: "Morning Session"
 *               location:
 *                 type: string
 *                 example: "Hall A"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-22T09:00:00.000Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 example: "2025-06-22T10:30:00.000Z"
 *     responses:
 *       201:
 *         description: Attendance session updated successfully
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
 *                   example: Attendance session updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: integer
 *                       example: 12
 *                     sessionName:
 *                       type: string
 *                       example: "Morning Session"
 *                     code:
 *                       type: string
 *                       example: "a1b2c3d4"
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-22T09:00:00.000Z"
 *                     endTime:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: "2025-06-22T10:00:00.000Z"
 *                     location:
 *                       type: string
 *                       example: "Hall A"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Bad request - Invalid data or session not found
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

export const updateAttendanceSession = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    const sessionData = req.body;
    console.log(sessionId);
     if (isNaN(sessionId)) {
      res.status(400).json({ success: false, message: 'Invalid session ID' });
      return;
    }
    
    const result = await updateSessionService(sessionId, sessionData);

   res.status(201).json(result);

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create attendance session',
    });
  }
};


export const toggleAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const getAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const getAttendanceSessionStats = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const markAttendanceForSession = async(req : Request , res : Response) : Promise<AttendanceResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}