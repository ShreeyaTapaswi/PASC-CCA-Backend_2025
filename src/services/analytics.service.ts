import { prisma } from '../lib/prisma';
import { EventStatus } from '@prisma/client';

// Admin Analytics Dashboard
export const getAdminAnalytics = async () => {
  try {
    // Total counts
    const [totalUsers, totalEvents, totalAttendances, totalRSVPs] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.attendance.count(),
      prisma.rsvp.count({ where: { status: 'ATTENDING' } })
    ]);

    // Events by status
    const eventsByStatus = await prisma.event.groupBy({
      by: ['status'],
      _count: true
    });

    // Department-wise participation
    const departmentStats = await prisma.user.groupBy({
      by: ['department'],
      _count: true,
      _avg: {
        hours: true
      }
    });

    // Recent events with attendance
    const recentEvents = await prisma.event.findMany({
      take: 10,
      orderBy: { startDate: 'desc' },
      include: {
        _count: {
          select: {
            rsvps: true,
            sessions: true
          }
        }
      }
    });

    // Monthly attendance trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const attendanceTrend = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "attendedAt") as month,
        CAST(COUNT(*) AS INTEGER) as count
      FROM "Attendance"
      WHERE "attendedAt" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `;

    // Top performing events (by attendance)
    const topEvents = await prisma.event.findMany({
      take: 5,
      include: {
        sessions: {
          include: {
            _count: {
              select: {
                attendances: true
              }
            }
          }
        },
        _count: {
          select: {
            rsvps: true
          }
        }
      },
      orderBy: {
        sessions: {
          _count: 'desc'
        }
      }
    });

    // RSVP vs Attendance rate
    const eventsWithStats = await prisma.event.findMany({
      where: {
        status: EventStatus.COMPLETED
      },
      include: {
        rsvps: {
          where: { status: 'ATTENDING', waitlisted: false }
        },
        sessions: {
          include: {
            attendances: true
          }
        }
      }
    });

    let totalRSVPCount = 0;
    let totalAttendanceCount = 0;

    eventsWithStats.forEach(event => {
      totalRSVPCount += event.rsvps.length;
      event.sessions.forEach(session => {
        totalAttendanceCount += session.attendances.length;
      });
    });

    const attendanceRate = totalRSVPCount > 0
      ? ((totalAttendanceCount / totalRSVPCount) * 100).toFixed(2)
      : 0;

    return {
      success: true,
      data: {
        overview: {
          totalUsers,
          totalEvents,
          totalAttendances,
          totalRSVPs,
          attendanceRate: parseFloat(attendanceRate as string)
        },
        eventsByStatus: eventsByStatus.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {} as Record<string, number>),
        departmentStats: departmentStats.map(dept => ({
          department: dept.department,
          userCount: dept._count,
          avgCredits: dept._avg.hours || 0
        })),
        recentEvents: recentEvents.map(event => ({
          id: event.id,
          title: event.title,
          startDate: event.startDate,
          status: event.status,
          rsvpCount: event._count.rsvps,
          sessionCount: event._count.sessions
        })),
        attendanceTrend,
        topEvents: topEvents.map(event => ({
          id: event.id,
          title: event.title,
          rsvpCount: event._count.rsvps,
          totalAttendance: event.sessions.reduce((sum, s) => sum + s._count.attendances, 0)
        }))
      }
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// User Analytics Dashboard
export const getUserAnalytics = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        attendances: {
          include: {
            session: {
              include: {
                event: true
              }
            }
          }
        },
        rsvps: {
          include: {
            event: true
          }
        }
      }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Calculate stats
    const totalCredits = user.hours;
    const eventsAttended = new Set(user.attendances.map(a => a.session.eventId)).size;
    const totalRSVPs = user.rsvps.length;
    const confirmedRSVPs = user.rsvps.filter(r => r.status === 'ATTENDING').length;

    // Attendance rate
    const attendanceRate = confirmedRSVPs > 0
      ? ((eventsAttended / confirmedRSVPs) * 100).toFixed(2)
      : 0;

    // Credits by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const creditsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', a."attendedAt") as month,
        CAST(SUM(s.credits) AS INTEGER) as credits
      FROM "Attendance" a
      JOIN "AttendanceSession" s ON a."sessionId" = s.id
      WHERE a."userId" = ${userId} AND a."attendedAt" >= ${sixMonthsAgo}
      GROUP BY month
      ORDER BY month ASC
    `;

    // Upcoming events
    const upcomingEvents = user.rsvps
      .filter(r => r.event.status === EventStatus.UPCOMING && r.status === 'ATTENDING')
      .map(r => ({
        id: r.event.id,
        title: r.event.title,
        startDate: r.event.startDate,
        location: r.event.location,
        credits: r.event.credits
      }));

    // Recent activity
    const recentAttendances = user.attendances
      .slice(0, 10)
      .map(a => ({
        eventTitle: a.session.event.title,
        sessionName: a.session.sessionName,
        credits: a.session.credits,
        attendedAt: a.attendedAt
      }));

    return {
      success: true,
      data: {
        overview: {
          totalCredits,
          eventsAttended,
          totalRSVPs,
          confirmedRSVPs,
          attendanceRate: parseFloat(attendanceRate as string)
        },
        creditsByMonth,
        upcomingEvents,
        recentActivity: recentAttendances
      }
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Event-specific analytics
export const getEventAnalytics = async (eventId: number) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: true,
        sessions: {
          include: {
            attendances: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    department: true,
                    year: true
                  }
                }
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                department: true,
                year: true
              }
            }
          }
        }
      }
    });

    if (!event) {
      return {
        success: false,
        message: 'Event not found'
      };
    }

    // RSVP stats
    const totalRSVPs = event.rsvps.length;
    const confirmedRSVPs = event.rsvps.filter(r => r.status === 'ATTENDING' && !r.waitlisted).length;
    const waitlistedRSVPs = event.rsvps.filter(r => r.waitlisted).length;
    const capacityUtilization = ((confirmedRSVPs / event.capacity) * 100).toFixed(2);

    // Attendance stats
    const totalAttendances = event.sessions.reduce((sum, s) => sum + s.attendances.length, 0);
    const uniqueAttendees = new Set(
      event.sessions.flatMap(s => s.attendances.map(a => a.userId))
    ).size;

    // Department-wise breakdown
    const departmentBreakdown = event.sessions
      .flatMap(s => s.attendances)
      .reduce((acc, att) => {
        const dept = att.user.department;
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // Year-wise breakdown
    const yearBreakdown = event.sessions
      .flatMap(s => s.attendances)
      .reduce((acc, att) => {
        const year = att.user.year;
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    // Review stats
    const avgRating = event.reviews.length > 0
      ? (event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length).toFixed(2)
      : 0;

    // Session-wise attendance
    const sessionStats = event.sessions.map(session => ({
      id: session.id,
      sessionName: session.sessionName,
      startTime: session.startTime,
      attendanceCount: session.attendances.length,
      credits: session.credits
    }));

    // Attendance list for "Credits & Attendance" table
    const attendanceList = event.sessions.flatMap(session =>
      session.attendances.map(attendance => ({
        id: attendance.id,
        userId: attendance.userId,
        user: {
          name: attendance.user.name,
          email: attendance.user.email,
          department: attendance.user.department,
          year: attendance.user.year
        },
        session: {
          id: session.id,
          name: session.sessionName,
          credits: session.credits
        },
        attendedAt: attendance.attendedAt
      }))
    );

    return {
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          capacity: event.capacity,
          status: event.status
        },
        rsvpStats: {
          total: totalRSVPs,
          confirmed: confirmedRSVPs,
          waitlisted: waitlistedRSVPs,
          capacityUtilization: parseFloat(capacityUtilization)
        },
        attendanceStats: {
          totalAttendances,
          uniqueAttendees,
          attendanceRate: confirmedRSVPs > 0
            ? ((uniqueAttendees / confirmedRSVPs) * 100).toFixed(2)
            : 0
        },
        demographics: {
          byDepartment: departmentBreakdown,
          byYear: yearBreakdown
        },
        reviews: {
          averageRating: parseFloat(avgRating as string),
          totalReviews: event.reviews.length,
          list: event.reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            review: r.review,
            createdAt: r.createdAt,
            user: r.anonymous ? null : (r as any).user
          }))
        },
        sessions: sessionStats,
        attendanceList // New field
      }
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};


