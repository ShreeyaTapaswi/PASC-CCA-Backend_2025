import { AnnouncementPriority } from '@prisma/client';

export interface AnnouncementCreate {
  title: string;
  message: string;
  priority?: AnnouncementPriority;
  targetAudience?: {
    departments?: string[];
    years?: number[];
  };
  expiresAt?: Date;
}

export interface AnnouncementResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}


