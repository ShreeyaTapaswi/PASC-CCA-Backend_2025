import { PrismaClient } from '@prisma/client';
import { RsvpResponse, RsvpAndEventResponse, RsvpAndUserResponse, RsvpCreate ,RsvpWithUser } from '../types/rsvp.types';

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
    console.log(existingRsvp);
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
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            location: true,
            capacity: true,
          },
        },
      },
    });

    const formattedRsvps = rsvps.map((rsvp) => ({
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
      },
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

export const findRsvpByEventId = async (eventId: number):Promise<RsvpResponse> => {
  if (isNaN(eventId)) {
    throw new Error('Invalid event ID');
  }

  const rsvp = await prisma.rsvp.findFirst({
    
    where: { eventId },
  });

  return {
      success: true,
      message: 'User RSVPs  successfully',
      data:rsvp
  }
};


export const getRsvpsByEventId = async (eventId: number) : Promise<RsvpWithUser> =>{

        const event = await prisma.event.findUnique({
        where: { id: eventId },
        });

        if (!event) {
            // Return null if event not found
            return null;
        }

    const rsvps = await prisma.rsvp.findMany({
        where : {eventId} ,
        include : {
            user : {
                select : {
                    id : true ,
                    name : true ,
                    email : true ,
                }
            }
        },
    });

    return rsvps ;
}
