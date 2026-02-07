import { prisma } from '../lib/prisma';
import { LeaderboardPeriod, Department } from '@prisma/client';
import { LeaderboardEntry, LeaderboardResponse, LeaderboardQuery } from '../types/leaderboard.types';

// Get leaderboard
export const getLeaderboard = async (
  query: LeaderboardQuery
): Promise<LeaderboardResponse> => {
  try {
    const { period, year, month, department, limit = 50 } = query;

    // Build date filter based on period
    let dateFilter: any = {};
    const currentDate = new Date();

    switch (period) {
      case LeaderboardPeriod.WEEKLY:
        const weekAgo = new Date(currentDate);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { gte: weekAgo };
        break;
      
      case LeaderboardPeriod.MONTHLY:
        const monthStart = new Date(year || currentDate.getFullYear(), (month || currentDate.getMonth()), 1);
        const monthEnd = new Date(year || currentDate.getFullYear(), (month || currentDate.getMonth()) + 1, 0);
        dateFilter = { gte: monthStart, lte: monthEnd };
        break;
      
      case LeaderboardPeriod.SEMESTER:
        // Assuming semester is 6 months
        const semesterStart = new Date(year || currentDate.getFullYear(), 0, 1);
        const semesterEnd = new Date(year || currentDate.getFullYear(), 5, 30);
        dateFilter = { gte: semesterStart, lte: semesterEnd };
        break;
      
      case LeaderboardPeriod.YEARLY:
        const yearStart = new Date(year || currentDate.getFullYear(), 0, 1);
        const yearEnd = new Date(year || currentDate.getFullYear(), 11, 31);
        dateFilter = { gte: yearStart, lte: yearEnd };
        break;
      
      case LeaderboardPeriod.ALL_TIME:
        // No date filter
        break;
    }

    // Get users with their attendance data
    const users = await prisma.user.findMany({
      where: department ? { department: department as Department } : {},
      select: {
        id: true,
        name: true,
        department: true,
        year: true,
        hours: true,
        attendances: {
          where: Object.keys(dateFilter).length > 0 ? {
            attendedAt: dateFilter
          } : {},
          include: {
            session: {
              select: {
                credits: true
              }
            }
          }
        }
      }
    });

    // Calculate credits and events attended for each user
    const leaderboardData: LeaderboardEntry[] = users.map(user => {
      const credits = user.attendances.reduce((sum, att) => sum + att.session.credits, 0);
      const eventsAttended = new Set(user.attendances.map(att => att.session.credits)).size;

      return {
        userId: user.id,
        userName: user.name || 'Anonymous',
        department: user.department,
        year: user.year,
        credits,
        eventsAttended: user.attendances.length,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by credits (descending) and assign ranks
    leaderboardData.sort((a, b) => b.credits - a.credits);
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Apply limit
    const limitedData = leaderboardData.slice(0, limit);

    return {
      success: true,
      data: limitedData
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get user's rank
export const getUserRank = async (
  userId: number,
  period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME
): Promise<{ rank: number; totalUsers: number; credits: number }> => {
  const leaderboard = await getLeaderboard({ period, limit: 10000 });
  
  if (!leaderboard.data) {
    return { rank: 0, totalUsers: 0, credits: 0 };
  }

  const userEntry = leaderboard.data.find(entry => entry.userId === userId);
  
  return {
    rank: userEntry?.rank || 0,
    totalUsers: leaderboard.data.length,
    credits: userEntry?.credits || 0
  };
};

// Update leaderboard cache (to be run periodically)
export const updateLeaderboardCache = async (
  period: LeaderboardPeriod,
  year: number,
  month?: number
): Promise<void> => {
  const leaderboard = await getLeaderboard({ period, year, month, limit: 100 });

  if (!leaderboard.data) return;

  // Delete old cache for this period
  await prisma.leaderboard.deleteMany({
    where: { period, year, month }
  });

  // Insert new cache
  const cacheData = leaderboard.data.map(entry => ({
    userId: entry.userId,
    rank: entry.rank,
    credits: entry.credits,
    eventsAttended: entry.eventsAttended,
    period,
    year,
    month
  }));

  await prisma.leaderboard.createMany({
    data: cacheData
  });
};

// Get cached leaderboard (faster)
export const getCachedLeaderboard = async (
  period: LeaderboardPeriod,
  year: number,
  month?: number,
  limit: number = 50
): Promise<LeaderboardResponse> => {
  try {
    const cachedData = await prisma.leaderboard.findMany({
      where: { period, year, month },
      orderBy: { rank: 'asc' },
      take: limit
    });

    if (cachedData.length === 0) {
      // Cache doesn't exist, generate it
      await updateLeaderboardCache(period, year, month);
      return getCachedLeaderboard(period, year, month, limit);
    }

    // Fetch user details
    const userIds = cachedData.map(entry => entry.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, department: true, year: true }
    });
    
    const userMap = new Map(users.map(u => [u.id, u]));

    const leaderboardData: LeaderboardEntry[] = cachedData.map(entry => {
      const user = userMap.get(entry.userId);
      return {
        rank: entry.rank,
        userId: entry.userId,
        userName: user?.name || 'Anonymous',
        department: user?.department || 'CE',
        year: user?.year || 1,
        credits: entry.credits,
        eventsAttended: entry.eventsAttended
      };
    });

    return {
      success: true,
      data: leaderboardData
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};


