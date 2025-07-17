export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED';

export interface EventInput {
  title: string;
  description: string;
  location: string;
  credits: number;
  numDays: number;
  capacity: number;
  startDate: string | Date;
  endDate: string | Date;
  prerequisite?: string;
}

export interface EventData {
  id: number;
  title: string;
  description: string;
  location: string;
  credits: number;
  numDays: number;
  capacity: number;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  prerequisite?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedEventData {
  events: EventData[];
  pagination: Pagination;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T|T[];
  error?: string;
}

// For fetching a single event (e.g., getEventById)
export type EventResponse = ApiResponse<EventData>;

// For paginated results (e.g., getEvents list)
export type PaginatedEventResponse = ApiResponse<PaginatedEventData>;
