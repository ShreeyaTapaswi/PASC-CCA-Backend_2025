import { PrismaClient } from '@prisma/client';
import { RsvpResponse,FormattedRsvp, RsvpAndEventResponse, RsvpAndUserResponse, RsvpCreate, RsvpWithUser, RsvpWithEvents ,FormattedRsvpResponse,RsvpStatus} from '../types/rsvp.types';
import { ApiResponse } from '../types/event.types';

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

export const getUserRsvps = async (userId: number): Promise<ApiResponse<any[]>> => {
  try {
    const rsvps = await prisma.rsvp.findMany({
      where: { userId },
      include: {
        event: true
      },
    });

    const formattedRsvps = rsvps.map(rsvp => ({
      id: rsvp.id.toString(),
      userId: rsvp.userId.toString(),
      eventId: rsvp.eventId.toString(),
      status: rsvp.status,
      createdAt: rsvp.createdAt.toISOString(),
      updatedAt: rsvp.createdAt.toISOString(), // Using createdAt since updatedAt doesn't exist
      event: {
        id: rsvp.event.id.toString(),
        title: rsvp.event.title,
        description: rsvp.event.description,
        date: rsvp.event.startDate.toISOString(),
        location: rsvp.event.location,
        capacity: rsvp.event.capacity
      }
    }));

    return {
      success: true,
      data: formattedRsvps
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getRsvpByEventId = async (eventId: number): Promise<ApiResponse<any>> => {
  try {
    const rsvp = await prisma.rsvp.findFirst({
      where: { eventId },
      include: {
        event: true
      }
    });

    if (!rsvp) {
      return {
        success: false,
        message: 'No RSVP found for this event',
        data: undefined
      };
    }

    const formattedRsvp = {
      id: rsvp.id.toString(),
      userId: rsvp.userId.toString(),
      eventId: rsvp.eventId.toString(),
      status: rsvp.status,
      createdAt: rsvp.createdAt.toISOString(),
      updatedAt: rsvp.createdAt.toISOString(), // Using createdAt since updatedAt doesn't exist
      event: {
        id: rsvp.event.id.toString(),
        title: rsvp.event.title,
        description: rsvp.event.description,
        date: rsvp.event.startDate.toISOString(),
        location: rsvp.event.location,
        capacity: rsvp.event.capacity
      }
    };

    return {
      success: true,
      data: formattedRsvp
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

export const getRsvpsByEventId = async (eventId: number): Promise<ApiResponse<RsvpWithUser[]>> => {
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


export const deleteRsvpById = async (rsvpId: number): Promise<RsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findUnique({
      where: {id: rsvpId}
    });
    if (!existingRsvp) {
      return {
        success: false,
        message: 'RSVP not found',
        data: undefined
      };
    }
    await prisma.rsvp.delete({
      where: {id: rsvpId}
    });
    return {
      success: true,
      message: 'RSVP deleted successfully',
      data: existingRsvp
    };
  } catch (error) {
    console.error('Service error deleting RSVP:', error);
    return {
      success: false,
      message: 'Failed to delete RSVP',
      data: undefined
    };
  }
}

export const UpdateRsvp = async (eventId: number, status: RsvpStatus): Promise<FormattedRsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findFirst({
      where: { eventId }
    });

    if (!existingRsvp) {
      return {
        success: false,
        message: "RSVP not found",
        data: undefined
      };
    }

    const updatedRsvp = await prisma.rsvp.update({
      where: { id: existingRsvp.id },
      data: { status }
    });

    const formattedRsvp: FormattedRsvp = {
      id: updatedRsvp.id.toString(),
      userId: updatedRsvp.userId.toString(),
      eventId: updatedRsvp.eventId.toString(),
      status: updatedRsvp.status,
      createdAt: updatedRsvp.createdAt.toISOString(),
      updatedAt: updatedRsvp.createdAt.toISOString()
    };

    return {
      success: true,
      message: "RSVP updated successfully",
      data: formattedRsvp
    };

  } catch (error) {
    console.error("Service error updating RSVP:", error);
    return {
      success: false,
      message: "Failed to update RSVP",
      data: undefined
    };
  }
};