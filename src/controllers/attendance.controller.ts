import { handleError } from "../utils/errorHandler";
import { AttendanceSession } from '@prisma/client';
import { Request, Response } from 'express';
import { AttendanceResponse, AttendanceSessionResponse } from '../types/attendance.types';
import {
  createSessionService,
  updateSessionService,
  getSessionStatisticsService,
  markSession,
  getUserAttendanceSessionStatsService,
  getUserAttendanceStats,
  getSessionsByEventIdService,
  getSessionsForUser,
} from '../services/attendance.service';
import { REPLCommand } from 'repl';

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
 *               - isActive
 *               - credits
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
 *                 example: "2025-06-22T10:00:00.000Z"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               credits:
 *                 type: number
 *                 example: 5
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
      message: handleError(error, 'Failed to create attendance session'),
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
 *               - isActive
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
 *               isActive:
 *                 type: boolean
 *                 example: true
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
      message: handleError(error, 'Failed to create attendance session'),
    });
  }
};

// export const toggleAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
//     res.status(501).json({
//         message: 'Not Implemented'
//     });
//     return {
//         success: false,
//         message: 'Not Implemented'
//     };
// }

// export const getAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
//     res.status(501).json({
//         message: 'Not Implemented'
//     });
//     return {
//         success: false,
//         message: 'Not Implemented'
//     };
// }

/**
 * @swagger
 * /api/attendance/sessions/{sessionId}/stats:
 *   get:
 *     summary: Get session statistics (Admin Only)
 *     description: Retrieve detailed statistics for a specific attendance session including total attendees, attendance rate, and attendance list
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         description: ID of the attendance session
 *         schema:
 *           type: integer
 *           example: 123
 *     responses:
 *       200:
 *         description: Session statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     sessionId:
 *                       type: string
 *                       description: The session ID
 *                       example: "123"
 *                     totalAttendees:
 *                       type: number
 *                       description: Total number of attendees who checked in
 *                       example: 25
 *                     attendanceRate:
 *                       type: number
 *                       description: Attendance rate as a percentage
 *                       example: 83.33
 *                     attendanceList:
 *                       type: array
 *                       description: List of attendees with their check-in details
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             description: User ID
 *                             example: "456"
 *                           name:
 *                             type: string
 *                             description: User's full name
 *                             example: "John Doe"
 *                           checkInTime:
 *                             type: string
 *                             format: date-time
 *                             description: When the user checked in
 *                             example: "2024-01-15T09:15:00.000Z"
 *       400:
 *         description: Bad request - Invalid session ID
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
 *                   example: "Invalid session ID."
 *       401:
 *         description: Unauthorized - Authentication required
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
 *       404:
 *         description: Session not found
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
 *                   example: "Session with ID 123 not found."
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export const getAttendanceSessionStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = parseInt(req.params.sessionId, 10);

    if (isNaN(sessionId)) {
      res.status(400).json({ success: false, message: 'Invalid session ID.' });
      return;
    }

    const stats = await getSessionStatisticsService(sessionId);

    res.status(200).json(stats);
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to get session statistics.',
    });
  }
};
/**
 * @swagger
 * /api/attendance/events/{eventId}/sessions/{sessionId}/attend:
 *   post:
 *     summary: Mark attendance for a user in a specific session
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         description: ID of the event
 *         schema:
 *           type: integer
 *       - in: path
 *         name: sessionId
 *         required: true
 *         description: ID of the session to mark attendance for
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: "a1b2c3d4"
 *     responses:
 *       200:
 *         description: Attendance marked successfully
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
 *                   example: Attendance marked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     sessionId:
 *                       type: integer
 *                       example: 12
 *                     attendedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-23T10:00:00.000Z"
 *       400:
 *         description: Bad request (invalid session, code mismatch, or already marked)
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
 *                   example: Invalid session code
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not authenticated
 */


export const markAttendanceForSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }
    const sessionId = parseInt(req.params.sessionId);
    const eventId = parseInt(req.params.eventId);


    const result = await markSession(userId, sessionId, code, eventId);
    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
}

/**
 * @swagger
 * /api/attendance/events/{eventId}/sessions/attendance:
 *   get:
 *     summary: Get user attendance session statistics for a specific event
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event to fetch attendance sessions for
 *     responses:
 *       200:
 *         description: Attendance session stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceUserEventSessionStatsResponse'
 *       401:
 *         description: Unauthorized - user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event or attendance session not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getUserAttendanceSessionStats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const eventId = parseInt(req.params.eventId);
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const stats = await getUserAttendanceSessionStatsService(userId, eventId);
    res.status(200).json(stats);
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to get user session statistics.',
    });
  }
}

/**
 * @swagger
 * /api/attendance/user-attendance-stats:
 *   get:
 *     summary: Get attendance statistics for the authenticated user
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserAttendanceStats'
 *       401:
 *         description: Unauthorized - user is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Could not retrieve user stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const data = await getUserAttendanceStats(userId);
    res.json(data).status(200);
    return;
  }
  catch (e) {
    res.status(404).json({
      success: false,
      message: e instanceof Error ? e.message : 'Failed to get user attendance stats',
    });
    return;
  }
}



/**
 * @swagger
 * /api/attendance/user/events/{eventId}/sessions:
 *   get:
 *     summary: Get all attendance sessions for a specific event
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event
 *     responses:
 *       200:
 *         description: Event and attendance sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AttendanceSessionWithEventForUser'
 *       400:
 *         description: Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Event not found or failed to get user attendance stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getSessionsForUserByEventId = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = Number(req.params.eventId);
    const userId = req.user?.id;
    if (isNaN(eventId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
      return;
    }
    const response = await getSessionsForUser(eventId, userId as number);
    res.status(200).json(response);
  } catch (e) {
    res.status(404).json({
      success: false,
      message: e instanceof Error ? e.message : 'Failed to get user attendance stats',
    });
    return;
  }
}



/**
 * @swagger
 * /api/attendance/events/{eventId}/sessions:
 *   get:
 *     summary: Get all attendance sessions for a specific event (Admin Only)
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
 *     responses:
 *       200:
 *         description: Attendance sessions fetched successfully
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
 *                   example: Attendance sessions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       eventId:
 *                         type: integer
 *                         example: 12
 *                       sessionName:
 *                         type: string
 *                         example: "Morning Session"
 *                       code:
 *                         type: string
 *                         example: "a1b2c3d4"
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-22T09:00:00.000Z"
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: "2025-06-22T10:00:00.000Z"
 *                       location:
 *                         type: string
 *                         example: "Hall A"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       credits:
 *                         type: integer
 *                         example: 5
 *       400:
 *         description: Bad request - Invalid event ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
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
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getSessionsByEventId = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }
    const result = await getSessionsByEventIdService(eventId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to fetch attendance sessions'),
    });
  }
};

export const exportAttendanceSessionsToExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    // Dynamic import to avoid circular dependency issues at the top of the file
    const { exportSessionsToExcel } = await import('../services/attendance.service');
    const { buffer, filename } = await exportSessionsToExcel(eventId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({
      success: false,
      message: handleError(error, 'Failed to export to Excel'),
    });
  }
};