import { Rsvp } from "./rsvp.types";


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
  prerequisite?: string | null;
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

//if user has rsvp into that event then the boolean will be true or else false
export interface EventAndRsvp {
  event : EventData ;
  rsvp : Rsvp | null;
}
export type EventUserResponse = ApiResponse<EventAndRsvp[]>;
// For fetching a single event (e.g., getEventById)
export type EventResponse = ApiResponse<EventData>;

// For paginated results (e.g., getEvents list)
export type PaginatedEventResponse = ApiResponse<PaginatedEventData>;
