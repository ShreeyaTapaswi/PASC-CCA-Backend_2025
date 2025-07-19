import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { AttendanceSessionCreate, AttendanceSessionResponse, AttendanceSessionWithEventForUser, AttendanceUserEventSessionStatsResponse, UserAttendanceStats, UserPersonalBest } from '../types/attendance.types';
const prisma = new PrismaClient();

export const createSessionService = async (eventId: number, data: AttendanceSessionCreate): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location, sessionName, isActive, credits } = data;

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
      sessionName,
      credits
    },
  });

  return {
    success: true,
    message: 'attendance session created successfully',
    data: {
      id: session.id,
      eventId: session.eventId,
      code: session.code,
      startTime: session.startTime,
      endTime: session.endTime ? session.endTime : null,
      location: session.location,
      sessionName: session.sessionName,
      isActive: session.isActive,
      credits : session.credits
    }

  };
};
////////////////////////////////////////////////////////////////////////////////////////////////

export const updateSessionService = async (
  sessionId: number,
  data: AttendanceSessionCreate
): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location, sessionName, isActive  , credits} = data;

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
      credits : credits
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
      credits : updatedSession.credits
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
      credits: session.credits
    },
  };
};
///////////////////////////////////////////////////////////////////////////////////////////////////
export const markSession = async (
  userId: number, sessionId: number, code: string, eventId: number
) => {

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error("Event not found");
  }
  //have to check session id is active or not 
  const session = await prisma.attendanceSession.findFirst({
    where: {
      id: sessionId,
      eventId: eventId, // Ensures the session belongs to this event
    },
    select: {
      code: true,
      isActive: true,
    },
  });

  if (!session) {
    throw new Error(`Session ID ${sessionId} does not belong to Event ID ${eventId}`);
  }

  if (!session.isActive) {
    throw new Error("Session is not active");
  }

  // console.log(session.code);
  // console.log(code);
  if (session.code !== code) {
    throw new Error("Invalid session code");
  }


  const alreadyMarked = await prisma.attendance.findFirst({
    where: {
      userId,
      sessionId,
    },
  });

  if (alreadyMarked) {
    throw new Error("Attendance already marked");
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




export const getUserAttendanceSessionStatsService = async (userId: number, eventId: number): Promise<AttendanceUserEventSessionStatsResponse> => {
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
    credits:session.credits,
    present: presentSessionIds.has(session.id)
  }));

  console.log(sessionStats);

  return {
    success: true,
    message: "Attendance session stats fetched successfully.",
    data: sessionStats,
  };

}

export const getSessionsForUser = async(eventId : number , userId  : number) : Promise<AttendanceSessionWithEventForUser> => {
  const event  = await prisma.event.findUnique({
    where : {
      id : eventId
    }
  });

  if (!event) {
    return {
      success: false,
      message: `Event with ID ${eventId} does not exist.`,
      data: undefined
    };
  }



  const sessions = await prisma.attendanceSession.findMany({
    where: { eventId },
    orderBy: { startTime: 'asc' },
    include : {
      attendances : {
        where : {
          userId 
        }
      }
    }
  });
  
  sessions.forEach((session , id) => {
    console.log("session : " );
    console.log(session);
    console.log("attendances of the session : ");
    session.attendances.forEach((attendances , id)=>{
      console.log(attendances);
    });
  })

  // Map sessions to AttendanceSessionForUser[]
  const sessionList = sessions.map(session => ({
    id: session.id,
    eventId: session.eventId,
    startTime: session.startTime,
    endTime: session.endTime,
    isActive: session.isActive,
    sessionName: session.sessionName,
    location: session.location,
    credits: session.credits,
    attended : session.attendances.length !== 0
  }));




  // Map event.prerequisite: null to undefined for type compatibility
  const eventData = {
    ...event,
    prerequisite: event.prerequisite === null ? undefined : event.prerequisite
  };

  return {
    success: true,
    message: 'Event and attendance sessions fetched successfully',
    data: {
      event: eventData,
      session: sessionList
    }
  };

}


export const getUserAttendanceStats = async (userId: number): Promise<UserAttendanceStats> => {
  const sessions = await prisma.attendance.findMany({
    where: {
      userId: userId,
    },
    include: {
      session: true, // includes AttendanceSession
    },
  });

  let totalCredits = 0;
  let bestSession: UserPersonalBest = {
    sessionId: 0,
    userId: userId,
    credits: 0,
  };

  sessions.forEach((attendance) => {
    const credits = attendance.session.credits;
    console.log('reached here');
    totalCredits += credits;

    if (attendance.session.credits > bestSession.credits) {
      console.log('reached here');
      bestSession = {
        sessionId: attendance.session.id,
        userId: attendance.userId,
        credits: credits,
      };
    }
  });

  const attendanceSessions = await prisma.attendanceSession.findMany({});
  const completionRate = attendanceSessions.length > 0
    ? (sessions.length / attendanceSessions.length) * 100
    : 0;

  return {
    sessionsAttended: sessions.length,
    sessions: sessions.map((a) => { return a.session }),
    totalCredits,
    completionRate,
    userPersonalBest: bestSession,
  };
};

// Fetch all attendance sessions for a given eventId
export const getSessionsByEventIdService = async (eventId: number) => {
  if (isNaN(eventId)) {
    throw new Error('Invalid event ID');
  }
  const sessions = await prisma.attendanceSession.findMany({
    where: { eventId },
    orderBy: { startTime: 'asc' },
    include: {
      attendances: true
    }
  });
  
  // Map sessions to include 'present' field and remove 'attendances'
  const mappedSessions = sessions.map(({ attendances, ...session }) => ({
    ...session,
    present: attendances.length
  }));

  return {
    success: true,
    message: 'Attendance sessions fetched successfully',
    data: mappedSessions,
  };
};