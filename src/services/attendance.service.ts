import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  AttendanceSession,
  AttendanceSessionWithEvent,
  AttendanceSessionCreate,
  AttendanceSessionToggleActive,
  AttendanceSessionUpdate,
  AttendanceSessionInput,
  Attendance,
  AttendanceResponse,
  AttendanceSessionResponse,
  AttendanceSessionWithEventResponse
} from '../types/attendance.types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createSessionService = async (eventId: number,data: AttendanceSessionCreate): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location,sessionName } = data;
   
    const event = await prisma.event.findUnique({
  where: { id: eventId },
});

if (!event) {
  throw new Error(`Event with ID ${eventId} does not exist.`);
}

   const missingFields = [];
if (!startTime) missingFields.push("startTime");
if (!eventId) missingFields.push("eventId");
if (!location) missingFields.push("location");
if (!sessionName) missingFields.push("sessionName");

if (missingFields.length > 0) {
  throw new Error(`Missing the required field(s): ${missingFields.join(", ")}`);
}

 
  // Step 1: Check if an active session already exists for this event
  const existing = await prisma.attendanceSession.findFirst({
    where: {
      eventId,
      isActive: true,
    },
  });

  if (existing) {
    throw new Error("An active session already exists for this event.");
  }

  const code = crypto.randomBytes(4).toString("hex");

  // Step 3: Create session
  const session = await prisma.attendanceSession.create({
    data: {
      eventId,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      isActive: true,
      code,
      location,
      sessionName
    },
  });

  // Step 4: Return response data
  return {
    success : true,
    message: 'attendance session created successfully',
    data:{
    // id: session.id.toString(),
    eventId: session.eventId,
    code: session.code,
    startTime:  session.startTime,
    endTime: session.endTime ? session.endTime : null,
    location: session.location ,
    sessionName: session.sessionName ,
    isActive:session.isActive
    }
  
  };
};
