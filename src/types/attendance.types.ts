import { User } from "@prisma/client";
import { ApiResponse, EventData } from "./event.types";

export interface AttendanceSession {
  id?: number;
  eventId: number;
  startTime: Date ;
  endTime?: Date | null;
  isActive: boolean;
  sessionName: string;
  code: string;
  location:string; // change
}

export interface AttendanceSessionWithEvent {
    id: number;
    eventId: number;
    startTime: Date;
    endTime?: Date | null;
    isActive: boolean;
    sessionName: string;
    code: string;
    event : EventData;
    location:string; 
}

export interface AttendanceSessionCreate{
    eventId : number;
    startTime: Date|null;
    endTime : Date|null;
    location: string;
    sessionName: string;
    
}

export interface AttendanceSessionToggleActive{
    id: number;
    isActive: boolean;
    evnetId : number;
}

export interface AttendanceSessionUpdate{
    id : number;
    eventId?: number;
    startTime?: Date;
    isActive?: boolean;
    sessionName?: string;
    location:string; 
}



export interface AttendanceSessionInput {
  eventId: number;
  startTime: Date;
  endTime?: Date | null;
  isActive: boolean;
  sessionName: string;
  location:string; 
}

export interface Attendance {
  id: number;
  userId: number;
  sessionId: number;
  user? : User | null;
  session: AttendanceSession;
  attendedAt: Date;
}



export type AttendanceResponse = ApiResponse<Attendance>;
export type AttendanceSessionResponse = ApiResponse<AttendanceSession>;
export type AttendanceSessionWithEventResponse = ApiResponse<AttendanceSessionWithEvent>;