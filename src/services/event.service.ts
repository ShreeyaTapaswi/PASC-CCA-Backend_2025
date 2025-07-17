import { PrismaClient } from '@prisma/client';
import { EventData, EventInput, EventResponse, PaginatedEventResponse } from '../types/event.types';

const prisma = new PrismaClient();

export const postEvent = async (eventData: EventInput): Promise<EventResponse> => {
    try {
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        const currentDate = new Date();

        if (isNaN(startDate.getTime())) {
            throw new Error('Invalid start date');
        }
        if (isNaN(endDate.getTime())) {
            throw new Error('Invalid end date');
        }
        if (startDate > endDate) {
            throw new Error('Start date cannot be after end date');
        }

        if(eventData.capacity<=0){
            throw new Error('Capacity should be greater than zero');
        }

        let status : 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
        if (startDate <= currentDate && endDate >= currentDate) {
            status = 'ONGOING';
        } else if (endDate < currentDate) {
            status = 'COMPLETED';
        }

        const result = await prisma.event.create({
            data: {
                ...eventData,
                status,
                startDate,
                endDate
            }
        });

        return {
            success: true,
            message: 'Event created successfully',
            data: result
        };

    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};

export const getEventsAdmin = async (): Promise<EventResponse> => {
    try {
        const events = await prisma.event.findMany({
            orderBy: {
                startDate: 'asc'
            }
        });

        return {
            success: true,
            message: 'Events fetched successfully',
            data: events
        }
    } catch (error) {
        console.error('Service error:', error);
        return {
            success: false,
            message: 'Failed to fetch events',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

export const updateEventService = async (eventId: number, eventData: EventInput): Promise<EventResponse> => {
    try {
        const startDate = new Date(eventData.startDate);
        const endDate = new Date(eventData.endDate);
        const currentDate = new Date();

        if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
        if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
        if (startDate > endDate) throw new Error('Start date cannot be after end date');

        let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
        if (startDate <= currentDate && endDate >= currentDate) {
            status = 'ONGOING';
        } else if (endDate < currentDate) {
            status = 'COMPLETED';
        }

        const result = await prisma.event.update({
            where: { id: eventId },
            data: {
                ...eventData,
                status,
                startDate,
                endDate,
            },
        });

        return {
            success: true,
            message: 'Event updated successfully',
            data: result,
        };
    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};


export const deleteEventById = async (id:number) : Promise<EventResponse> => {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) {
    throw new Error('Event not found');
    }
    await prisma.event.delete({ where: { id } });
    return {
        success: true,
        message: 'Event deleted successfully',
        data: event
    };
};


export const fetchAllEvents = async (
  page = 1,
  limit = 10,
  search?: string,
  date?: string
): Promise<PaginatedEventResponse> => {
  try {
    const skip = (page - 1) * limit;
    const where: any = {};

    // Filter by search keyword
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by date 
    if (date) {
      const filterDate = new Date(date);
      if (!isNaN(filterDate.getTime())) {
        where.startDate = { lte: filterDate };
        where.endDate = { gte: filterDate };
      }
    }

    // Get events and total count
    const [eventsRaw, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' }
      }),
      prisma.event.count({ where })
    ]);

    // Map raw events to EventData format
    const events: EventData[] = eventsRaw.map((event) => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      credits: event.credits,
      numDays: event.numDays,
      capacity: event.capacity,
      status: event.status, // assuming this exists
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
      prerequisite: event.prerequisite
    }));

    return {
      success: true,
      data: {
        events,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

export const getEventByIdPublic = async (id: number): Promise<EventResponse> => {
    try {
        const event = await prisma.event.findUnique({
            where: { id }
        });

        if (!event) {
            return {
                success: false,
                message: 'Event not found',
                error: 'No event found with the provided ID'
            };
        }

        return {
            success: true,
            message: 'Event fetched successfully',
            data: event
        };
    } catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};


//Filter by event status 
export const fetchEventByStatus = async (status : 'UPCOMING' | 'ONGOING' | 'COMPLETED') => {
    try {
        const events = await prisma.event.findMany({
            where : {status} ,
            orderBy : {startDate : 'asc'}
        }) ;

        return {
            success : true ,
            message : `Events with status ${status} fetched successfully` ,
            data : events
        };
    } catch(error) {
        return {
            success : false ,
            message : 'Failed to fetch events by status' ,
            error : error instanceof Error ? error.message : 'Unknown error'
        } ;
    }
};