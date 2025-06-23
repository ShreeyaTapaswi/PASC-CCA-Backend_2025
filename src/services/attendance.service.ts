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
  AttendanceSessionWithEventResponse,
  AttendanceUserEventSessionStatsResponse
} from '../types/attendance.types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const createSessionService = async (eventId: number,data: AttendanceSessionCreate): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location,sessionName,isActive } = data;
   
    const event = await prisma.event.findUnique({
  where: { id: eventId },
});

if (!event) {
  throw new Error(`Event with ID ${eventId} does not exist.`);
}

   const missingFields = [];
if (!startTime) missingFields.push("startTime");

if (!location) missingFields.push("location");
if (!sessionName) missingFields.push("sessionName");

if (missingFields.length > 0) {
  throw new Error(`Missing the required field(s): ${missingFields.join(", ")}`);
}

  const code = crypto.randomBytes(4).toString("hex");

  const session = await prisma.attendanceSession.create({
    data: {
      eventId,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
      code,
      location,
      sessionName
    },
  });

  return {
    success : true,
    message: 'attendance session created successfully',
    data:{
    id: session.id,
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
////////////////////////////////////////////////////////////////////////////////////////////////

export const updateSessionService = async (
  sessionId: number,
  data: AttendanceSessionCreate
): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location, sessionName, isActive} = data;

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Attendance session with ID ${sessionId} does not exist.`);
  }

const updatedSession = await prisma.attendanceSession.update({
  where: { id: sessionId },
  data: {
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
    location: location !== undefined ? location : undefined,
    sessionName: sessionName !== undefined ? sessionName : undefined,
    isActive: typeof isActive === 'boolean' ? isActive : undefined,
  },
});

  return {
    success: true,
    message: "Attendance session updated successfully",
    data: {
      eventId: updatedSession.eventId,
      sessionName: updatedSession.sessionName,
      startTime: updatedSession.startTime,
      endTime: updatedSession.endTime,
      location: updatedSession.location,
      code: updatedSession.code,
      isActive: updatedSession.isActive,
    },
  };
};
/////////////////////////////////////////////////////////////////////////////////////////////
export const getSessionStatisticsService = async (sessionId: number) => {
  // 1. Find the session
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      event: {
        select: {
          capacity: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found.`);
  }

  // 2. Get attendance records and count
  const attendanceRecords = await prisma.attendance.findMany({
    where: { sessionId: sessionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      attendedAt: 'asc',
    },
  });

  const totalAttendees = attendanceRecords.length;

  // 3. Get total expected attendees from the event capacity
  const totalExpectedAttendees = session.event.capacity || totalAttendees;

  // 4. Calculate attendance rate
  const attendanceRate =
    totalExpectedAttendees > 0
      ? (totalAttendees / totalExpectedAttendees) * 100
      : 0;

  // 5. Format the attendance list
  const attendanceList = attendanceRecords.map((record) => ({
    userId: record.user.id.toString(),
    name: record.user.name,
    checkInTime: record.attendedAt.toISOString(),
  }));

  // 6. Return the statistics
  return {
    success: true,
    data: {
      sessionId: sessionId.toString(),
      totalAttendees,
      attendanceRate: parseFloat(attendanceRate.toFixed(2)),
      attendanceList,
    },
  };
};
///////////////////////////////////////////////////////////////////////////////////////////////////
export const getAttendanceSessionService = async (
  sessionId: number
): Promise<AttendanceSessionResponse> => {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Attendance session with ID ${sessionId} does not exist.`);
  }

  return {
    success: true,
    message: 'Attendance session retrieved successfully',
    data: {
      eventId: session.eventId,
      code: session.code,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location,
      sessionName: session.sessionName,
      isActive: session.isActive,
    },
  };
};
///////////////////////////////////////////////////////////////////////////////////////////////////
export const markSession= async (
  userId: number,sessionId: number,code:string,eventId:number
)=> {
 
    const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }
  //have to check session id is active or not 
 const session = await prisma.attendanceSession.findUnique({
  where: { id: sessionId },
  select: { code: true, isActive: true },
});


  if (!session) {
    throw new Error("Session not found");
  }

  if (!session.isActive) {
    throw new Error("Session is not active");
  }

  console.log(session.code);
  console.log(code);
  if (session.code !== code) {
    throw new Error("Invalid session code");
  }

const attendance = await prisma.attendance.create({
  data: {
    userId: userId,
    sessionId: sessionId,
  },
});

 return {
    success: true,
    message: "Attendance marked successfully",
    data: attendance,
  };
  }


//   return {
//     success: true,
//     message: "Attendance session updated successfully",
//     data: {
//       eventId: updatedSession.eventId,
//       sessionName: updatedSession.sessionName,
//       startTime: updatedSession.startTime,
//       endTime: updatedSession.endTime,
//       location: updatedSession.location,
//       code: updatedSession.code,
//       isActive: updatedSession.isActive,
//     },
//   };
// };


export const getUserAttendanceSessionStatsService = async (userId : number , eventId : number) : Promise<AttendanceUserEventSessionStatsResponse> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error(`Event with ID ${eventId} does not exist.`);
  }

  const attendanceSessions = await prisma.attendanceSession.findMany({
    where: { eventId: eventId },
  });


  if (attendanceSessions.length === 0) {
    return {
      success: true,
      message: "No attendance sessions found for this event.",
      data: [],
    };
  }
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      userId: userId,
      sessionId: {
        in: attendanceSessions.map((session) => session.id),
      },
    },
    select: {
      sessionId: true,
    },
  });

  // Create a Set for fast lookup
  const presentSessionIds = new Set(attendanceRecords.map(record => record.sessionId));

  // Construct the result
  const sessionStats = attendanceSessions.map(session => ({
    sessionId: session.id,
    eventId: session.eventId,
    startTime: session.startTime,
    endTime: session.endTime,
    code: session.code,
    location: session.location,
    sessionName: session.sessionName,
    present: presentSessionIds.has(session.id)
  }));

  console.log(sessionStats);

  return {
    success: true,
    message: "Attendance session stats fetched successfully.",
    data: sessionStats,
  };


  
}