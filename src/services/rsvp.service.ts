import { PrismaClient } from '@prisma/client';
import { RsvpResponse, RsvpCreate, RsvpWithUser, RsvpStatus } from '../types/rsvp.types';
import { ApiResponse } from '../types/event.types';

const prisma = new PrismaClient();

export const postrsvp = async (rsvpData: RsvpCreate, userId: number): Promise<RsvpResponse> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: rsvpData.eventId
      }
    })
    if (!event) {
      return {
        success: false,
        message: 'NO SUCH EVENT PRESENT'
      };
    }

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


    return {
      success: true,
      data: rsvps
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getRsvpByEventId = async (userId: number, eventId: number): Promise<RsvpResponse> => {
  try {
    const rsvp = await prisma.rsvp.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
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
      data: rsvp
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


export const deleteRsvpById = async (userId : number ,rsvpId: number): Promise<RsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findUnique({
      where: { id: rsvpId , userId : userId  }
    });
    if (!existingRsvp) {
      return {
        success: false,
        message: 'RSVP not found',
        data: undefined
      };
    }
    await prisma.rsvp.delete({
      where: { id: rsvpId }
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

export const UpdateRsvp = async (userId: number, eventId: number, status: RsvpStatus): Promise<RsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findUnique({
      where: {
        userId_eventId: {
          userId: userId,
          eventId: eventId
        }
      }
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



    return {
      success: true,
      message: "RSVP updated successfully",
      data: updatedRsvp
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