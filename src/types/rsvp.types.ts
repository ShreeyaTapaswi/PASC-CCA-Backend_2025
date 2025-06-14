import { User } from "@prisma/client";
import { ApiResponse, EventData } from "./event.types";

export type RsvpStatus = "ATTENDING" | "NOT_ATTENDING";

export  interface Rsvp {
    id: number;
    eventId: number;
    userId: number;
    status : RsvpStatus;
}
export interface RsvpResponse {
    id: number; 
    eventId: number;
    userId: number;
    status : RsvpStatus;
    createdAt: Date;
    updatedAt: Date;
}
export interface RsvpWithEvents{
    id: number;
    status : RsvpStatus;
    eventId: number;
    userId: number;
    event: EventData;
}

export interface RsvpWithUser{
    id: number;
    status : RsvpStatus;
    eventId: number;
    userId: number;
    user: User;
}

export type EventResponse = ApiResponse<RsvpResponse>;

export type RsvpAndEventReponse = ApiResponse<RsvpWithEvents>

export type RsvpAndUserReponse = ApiResponse<RsvpWithUser>