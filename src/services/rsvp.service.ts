import { PrismaClient } from '@prisma/client';
import { RsvpResponse, RsvpAndEventResponse, RsvpAndUserResponse, RsvpCreate, RsvpWithUser, RsvpWithEvents } from '../types/rsvp.types';

const prisma = new PrismaClient();

export const postrsvp = async (rsvpData: RsvpCreate, userId: number): Promise<RsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findUnique({
      where: {
        userId_eventId: {  
          userId: userId,
          eventId: rsvpData.eventId
        }
      }
    });

    if (existingRsvp) {
      return {
        success: false,
        message: 'RSVP already exists for this user and event',
        data: existingRsvp,
      };
    }

    const result = await prisma.rsvp.create({
      data: {
        ...rsvpData,
        userId: userId  
      }
    });
    
    return {
      success: true,
      message: 'RSVP created successfully',
      data: result
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getUserRsvps = async (userId: number): Promise<RsvpAndEventResponse> => {
  try {
    const rsvps = await prisma.rsvp.findMany({
      where: { userId },
      include: {
        event: true
      },
    });

    const formattedRsvps: RsvpWithEvents[] = rsvps.map((rsvp) => ({
      id: rsvp.id,
      userId: rsvp.userId,
      eventId: rsvp.eventId,
      status: rsvp.status,
      createdAt: rsvp.createdAt,
      event: {
        id: rsvp.event.id,
        title: rsvp.event.title,
        description: rsvp.event.description,
        location: rsvp.event.location,
        credits: rsvp.event.credits,
        numDays: rsvp.event.numDays,
        capacity: rsvp.event.capacity,
        status: rsvp.event.status,
        startDate: rsvp.event.startDate,
        endDate: rsvp.event.endDate,
        createdAt: rsvp.event.createdAt,
        updatedAt: rsvp.event.updatedAt
      }
    }));

    return {
      success: true,
      message: 'User RSVPs retrieved successfully',
      data: formattedRsvps,
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const findRsvpByEventId = async (eventId: number): Promise<RsvpResponse> => {
  if (isNaN(eventId)) {
    throw new Error('Invalid event ID');
  }

  const rsvp = await prisma.rsvp.findFirst({
    where: { eventId },
  });

  if (!rsvp) {
    return {
      success: false,
      message: 'No RSVP found for this event',
      data: undefined
    };
  }

  return {
    success: true,
    message: 'RSVP found successfully',
    data: rsvp
  };
};

export const getRsvpsByEventId = async (eventId: number): Promise<RsvpAndUserResponse> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return {
      success: false,
      message: 'Event not found',
      data: undefined
    };
  }

  const rsvps = await prisma.rsvp.findMany({
    where: { eventId },
    include: {
      user: true
    },
  });

  return {
    success: true,
    message: 'RSVPs retrieved successfully',
    data: rsvps
  };
};