import { EventData, EventInput, EventResponse, PaginatedEventResponse, EventUserResponse } from '../types/event.types';
import { prisma } from '../lib/prisma';

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

        if (eventData.capacity <= 0) {
            throw new Error('Capacity should be greater than zero');
        }

        let status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' = 'UPCOMING';
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

export const getEventsForUser = async (userId: number): Promise<EventUserResponse> => {
    try {
        const events = await prisma.event.findMany({
            where: { isDeleted: { not: true } },
            orderBy: { startDate: 'asc' },
            include: {
                rsvps: {
                    where: { userId }
                }
            }
        });

        // Map to EventAndRsvp[]
        const eventsWithRsvp = events.map(event => {
            // Convert event to EventData shape
            const { rsvps, ...eventData } = event;
            const eventDataObj = {
                id: event.id,
                title: event.title,
                description: event.description,
                location: event.location,
                credits: event.credits,
                numDays: event.numDays,
                capacity: event.capacity,
                status: event.status,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt)
            };
            return {
                event: eventDataObj,
                rsvp: rsvps.length > 0 ? rsvps[0] : null
            };
        });

        return {
            success: true,
            message: 'Events fetched successfully',
            data: eventsWithRsvp
        };
    } catch (error) {
        console.error('Service error:', error);
        return {
            success: false,
            message: 'Failed to fetch events for user',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

export const getEventsAdmin = async (
    page = 1,
    limit = 10,
    search?: string
): Promise<PaginatedEventResponse> => {
    try {
        // Always refresh event statuses before returning results so the admin
        // sees accurate UPCOMING / ONGOING / COMPLETED labels.
        await refreshEventStatuses();

        const skip = (page - 1) * limit;
        const where: any = { isDeleted: { not: true } };

        // Filter by search keyword (title or description, case-insensitive)
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [eventsRaw, total] = await Promise.all([
            prisma.event.findMany({
                where,
                skip,
            include: {
                _count: {
                    select: {
                        rsvps: {
                            where: { status: 'CONFIRMED' }
                        }
                    }
                }
            },
            take: limit,
                orderBy: { startDate: 'asc' }
            }),
            prisma.event.count({ where })
        ]);

        const events: EventData[] = eventsRaw.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            credits: event.credits,
            numDays: event.numDays,
            capacity: event.capacity,
            status: event.status,
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
        return {
            success: false,
            data: {
                events: [],
                pagination: { total: 0, page, limit, pages: 0 }
            }
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


export const deleteEventById = async (id: number): Promise<EventResponse> => {
    try {
        const event = await prisma.event.findUnique({ where: { id } });
        if (!event) {
            throw new Error('Event not found');
        }

        const updatedEvent = await prisma.event.update({
            where: { id },
            data: { isDeleted: true }
        });

        return {
            success: true,
            message: 'Event deleted successfully',
            data: updatedEvent
        };
    } catch (error) {
        console.error('Service error (deleteEventById):', error);
        throw error;
    }
};


export const fetchAllEvents = async (
    page = 1,
    limit = 10,
    search?: string,
    date?: string
): Promise<PaginatedEventResponse> => {
    try {
        const skip = (page - 1) * limit;
        const where: any = { isDeleted: { not: true } };

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
            where: { id },
            include: {
                _count: {
                    select: {
                        rsvps: {
                            where: { status: 'CONFIRMED' }
                        }
                    }
                }
            }
        });

        if (!event || event.isDeleted) {
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
export const fetchEventByStatus = async (status: 'UPCOMING' | 'ONGOING' | 'COMPLETED') => {
    try {
        const events = await prisma.event.findMany({
            where: { status, isDeleted: { not: true } },
            orderBy: { startDate: 'asc' }
        });

        return {
            success: true,
            message: `Events with status ${status} fetched successfully`,
            data: events
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to fetch events by status',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Refreshes the status of all events based on the current time.
 * - UPCOMING  → ONGOING  : if startDate <= now <= endDate
 * - UPCOMING/ONGOING → COMPLETED : if endDate < now
 * Runs on server startup and on a scheduled interval.
 */
export const refreshEventStatuses = async (): Promise<{ updated: number }> => {
    const now = new Date();

    // Mark events as ONGOING (startDate has passed but endDate hasn't yet)
    const ongoingResult = await prisma.event.updateMany({
        where: {
            status: { not: 'ONGOING' },
            startDate: { lte: now },
            endDate: { gte: now },
        },
        data: { status: 'ONGOING' },
    });

    // Mark events as COMPLETED (endDate has passed)
    const completedResult = await prisma.event.updateMany({
        where: {
            status: { not: 'COMPLETED' },
            endDate: { lt: now },
        },
        data: { status: 'COMPLETED' },
    });

    const updated = ongoingResult.count + completedResult.count;
    return { updated };
};
