import crypto from 'crypto';
import { AttendanceSessionCreate, AttendanceSessionResponse, AttendanceSessionWithEventForUser, AttendanceUserEventSessionStatsResponse, UserAttendanceStats, UserPersonalBest } from '../types/attendance.types';
import { prisma } from '../lib/prisma';
import { sendAttendanceMarkedEmail } from './email.service';
import { notifyAttendanceMarked } from './notification.service';
import exceljs from 'exceljs';

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

  // Validate session dates are within the event date range (compare date portions only)
  const sessionStartDate = new Date(startTime as Date).toISOString().split('T')[0];
  const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
  const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];

  if (sessionStartDate < eventStartDate) {
    throw new Error(`Session start time cannot be before the event start date (${eventStartDate}).`);
  }
  if (sessionStartDate > eventEndDate) {
    throw new Error(`Session start time cannot be after the event end date (${eventEndDate}).`);
  }
  if (endTime) {
    const sessionEndDate = new Date(endTime).toISOString().split('T')[0];
    if (sessionEndDate < eventStartDate) {
      throw new Error(`Session end time cannot be before the event start date (${eventStartDate}).`);
    }
    if (sessionEndDate > eventEndDate) {
      throw new Error(`Session end time cannot be after the event end date (${eventEndDate}).`);
    }
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
      credits: session.credits
    }

  };
};
////////////////////////////////////////////////////////////////////////////////////////////////

export const updateSessionService = async (
  sessionId: number,
  data: AttendanceSessionCreate
): Promise<AttendanceSessionResponse> => {
  const { startTime, endTime, location, sessionName, isActive, credits } = data;

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error(`Attendance session with ID ${sessionId} does not exist.`);
  }

  // Validate session dates are within the event date range
  if (startTime || endTime) {
    const event = await prisma.event.findUnique({
      where: { id: session.eventId },
    });

    if (event) {
      const eventStartDate = new Date(event.startDate).toISOString().split('T')[0];
      const eventEndDate = new Date(event.endDate).toISOString().split('T')[0];

      if (startTime) {
        const sessionStartDate = new Date(startTime).toISOString().split('T')[0];
        if (sessionStartDate < eventStartDate) {
          throw new Error(`Session start time cannot be before the event start date (${eventStartDate}).`);
        }
        if (sessionStartDate > eventEndDate) {
          throw new Error(`Session start time cannot be after the event end date (${eventEndDate}).`);
        }
      }
      if (endTime) {
        const sessionEndDate = new Date(endTime).toISOString().split('T')[0];
        if (sessionEndDate < eventStartDate) {
          throw new Error(`Session end time cannot be before the event start date (${eventStartDate}).`);
        }
        if (sessionEndDate > eventEndDate) {
          throw new Error(`Session end time cannot be after the event end date (${eventEndDate}).`);
        }
      }
    }
  }

  const updatedSession = await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      location: location !== undefined ? location : undefined,
      sessionName: sessionName !== undefined ? sessionName : undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
      credits: credits
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
      credits: updatedSession.credits
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

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create attendance record
    const attendance = await tx.attendance.create({
      data: {
        userId: userId,
        sessionId: sessionId,
      },
    });

    // Get session details for credits
    const sessionDetails = await tx.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { event: true }
    });

    if (sessionDetails) {
      // Update user's total hours/credits
      await tx.user.update({
        where: { id: userId },
        data: {
          hours: { increment: sessionDetails.credits }
        }
      });

      // Get user details for notification
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      if (user) {
        // Send email and notification (async, don't block)
        setImmediate(async () => {
          await sendAttendanceMarkedEmail(
            user.email,
            user.name || 'Student',
            sessionDetails.event.title,
            sessionDetails.sessionName,
            sessionDetails.credits
          );

          await notifyAttendanceMarked(
            userId,
            sessionDetails.eventId,
            sessionDetails.event.title,
            sessionDetails.credits
          );
        });
      }
    }

    return attendance;
  });

  return {
    success: true,
    message: "Attendance marked successfully",
    data: result,
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
    credits: session.credits,
    present: presentSessionIds.has(session.id)
  }));

  console.log(sessionStats);

  return {
    success: true,
    message: "Attendance session stats fetched successfully.",
    data: sessionStats,
  };

}

export const getSessionsForUser = async (eventId: number, userId: number): Promise<AttendanceSessionWithEventForUser> => {
  const event = await prisma.event.findUnique({
    where: {
      id: eventId
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
    include: {
      attendances: {
        where: {
          userId
        }
      }
    }
  });

  sessions.forEach((session, id) => {
    console.log("session : ");
    console.log(session);
    console.log("attendances of the session : ");
    session.attendances.forEach((attendances, id) => {
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
    attended: session.attendances.length !== 0
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
  // Fetch all events the user has actively RSVPd to
  const userRsvps = await prisma.rsvp.findMany({
    where: { userId, status: 'ATTENDING' },
    select: { eventId: true },
  });
  const rsvpEventIds = new Set(userRsvps.map((r) => r.eventId));

  // Fetch all attendance records for this user, including session details
  const allAttendances = await prisma.attendance.findMany({
    where: { userId },
    include: { session: true },
  });

  // Only count sessions that belong to an event the user RSVPd to
  const qualifyingAttendances = allAttendances.filter((a) =>
    rsvpEventIds.has(a.session.eventId)
  );

  let totalCredits = 0;
  let bestSession: UserPersonalBest = {
    sessionId: 0,
    userId: userId,
    credits: 0,
  };

  qualifyingAttendances.forEach((attendance) => {
    const credits = attendance.session.credits;
    totalCredits += credits;

    if (credits > bestSession.credits) {
      bestSession = {
        sessionId: attendance.session.id,
        userId: attendance.userId,
        credits,
      };
    }
  });

  // completionRate = sessions attended (qualifying) / total sessions of RSVPd events
  let totalRsvpdSessions = 0;
  if (rsvpEventIds.size > 0) {
    totalRsvpdSessions = await prisma.attendanceSession.count({
      where: { eventId: { in: [...rsvpEventIds] } },
    });
  }
  const completionRate =
    totalRsvpdSessions > 0
      ? (qualifyingAttendances.length / totalRsvpdSessions) * 100
      : 0;

  return {
    sessionsAttended: qualifyingAttendances.length,
    sessions: qualifyingAttendances.map((a) => a.session),
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

export const exportSessionsToExcel = async (eventId: number) => {
  if (isNaN(eventId)) {
    throw new Error('Invalid event ID');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new Error(`Event with ID ${eventId} does not exist.`);
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: { eventId },
    orderBy: { startTime: 'asc' },
    include: {
      attendances: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const workbook = new exceljs.Workbook();
  workbook.creator = 'PASC CCA System';
  workbook.created = new Date();

  // Track sheet names to avoid duplicates
  const usedSheetNames = new Set<string>();

  sessions.forEach((session) => {
    // Worksheet names cannot exceed 31 characters, cannot start/end with ', and cannot contain : \ / ? * [ ]
    let safeSheetName = (session.sessionName || `Session ${session.id}`)
      .replace(/[\\/?*[\]:]/g, '_')
      .trim();

    // Ensure <= 31 chars
    if (safeSheetName.length > 31) {
      safeSheetName = safeSheetName.substring(0, 31).trim();
    }

    // Handle duplicates
    let finalSheetName = safeSheetName;
    let counter = 1;
    while (usedSheetNames.has(finalSheetName.toLowerCase())) {
      const suffix = ` (${counter})`;
      const maxLength = 31 - suffix.length;
      finalSheetName = `${safeSheetName.substring(0, maxLength)}${suffix}`;
      counter++;
    }
    usedSheetNames.add(finalSheetName.toLowerCase());

    const worksheet = workbook.addWorksheet(finalSheetName);

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Check-in Status', key: 'status', width: 20 },
      { header: 'Check-in Time', key: 'time', width: 25 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };

    session.attendances.forEach((attendance) => {
      worksheet.addRow({
        name: attendance.user.name || 'N/A',
        email: attendance.user.email,
        status: 'Checked In',
        time: attendance.attendedAt.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer,
    filename: `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`,
  };
};