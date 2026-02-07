import { LeaderboardPeriod } from '@prisma/client';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  userName: string;
  department: string;
  year: number;
  credits: number;
  eventsAttended: number;
}

export interface LeaderboardResponse {
  success: boolean;
  message?: string;
  data?: LeaderboardEntry[];
  error?: string;
}

export interface LeaderboardQuery {
  period: LeaderboardPeriod;
  year?: number;
  month?: number;
  department?: string;
  limit?: number;
}


