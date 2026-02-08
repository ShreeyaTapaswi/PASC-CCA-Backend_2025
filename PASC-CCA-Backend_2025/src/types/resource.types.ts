import { ResourceType } from '@prisma/client';

export interface EventResourceCreate {
  eventId: number;
  title: string;
  description?: string;
  type: ResourceType;
  url: string;
  fileSize?: number;
}

export interface EventResourceResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}


