import { User } from "@prisma/client";
import { ApiResponse, EventData } from "./event.types";

export type RsvpStatus = "ATTENDING" | "NOT_ATTENDING";

// export interface Rsvp {
//     id: number;
//     eventId: number;
//     userId: number;
//     status: RsvpStatus;
//     createdAt: Date;
// }

export interface RsvpCreate {
  eventId: number,
  status: RsvpStatus
}

export interface Rsvp {
    id: number; 
    eventId: number; //ip
    userId: number; //midleware
    status: RsvpStatus;//ip
    createdAt: Date;
}

export interface RsvpWithEvents {
    id: number;
    status: RsvpStatus;
    eventId: number;
    userId: number;
    createdAt: Date;
    event: EventData;   
}

export interface RsvpWithUser {
    id: number;
    status: RsvpStatus;
    eventId: number;
    userId: number;
    createdAt: Date;
    user: User;
}

export type RsvpResponse = ApiResponse<Rsvp>;
export type RsvpAndEventResponse = ApiResponse<RsvpWithEvents>;
export type RsvpAndUserResponse = ApiResponse<RsvpWithUser>;