import { User } from "@prisma/client";
import { ApiResponse, EventData } from "./event.types";

export interface AttendanceSession {
  id?: number;
  eventId: number;
  startTime?: Date|null ;
  endTime?: Date | null;
  isActive: boolean;
  sessionName: string;
  code: string;
  location:string; 
  credits : number;
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
    credits : number;
}

export interface AttendanceSessionCreate{
    eventId : number;
    startTime: Date|null;
    endTime : Date|null;
    location: string;
    sessionName: string;
    isActive:boolean;
    credits : number;
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
    credits:number;
}
export interface UserAttendanceStats{
  sessionsAttended : number;
  sessions: AttendanceSession[];
  totalCredits: number;
  completionRate : number;
  userPersonalBest : UserPersonalBest;
}

export interface UserPersonalBest{
  sessionId: number;
  userId : number;
  credits : number;
}


export interface AttendanceSessionInput {
  eventId: number;
  startTime: Date;
  endTime?: Date | null;
  isActive: boolean;
  sessionName: string;
  location:string; 
  credits:number;
}

export interface Attendance {
  id: number;
  userId: number;
  sessionId: number;
  user? : User | null;
  session: AttendanceSession;
  attendedAt: Date;
}

export interface UserEventSessionStats{
  sessionId : number;
  sessionName: string;
  eventId: number;
  startTime: Date;
  endTime: Date | null;
  code: string;
  location: string;
  present: boolean;
  credits:number;
}



export type AttendanceResponse = ApiResponse<Attendance>;
export type AttendanceSessionResponse = ApiResponse<AttendanceSession>;
export type AttendanceSessionWithEventResponse = ApiResponse<AttendanceSessionWithEvent>;
export type AttendanceUserEventSessionStatsResponse = ApiResponse<UserEventSessionStats>;