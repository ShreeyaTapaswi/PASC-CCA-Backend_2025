import { prisma } from '../lib/prisma';
import { EventResourceCreate, EventResourceResponse } from '../types/resource.types';

// Create event resource
export const createEventResource = async (
  resourceData: EventResourceCreate
): Promise<EventResourceResponse> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: resourceData.eventId }
    });

    if (!event) {
      return {
        success: false,
        message: 'Event not found'
      };
    }

    const resource = await prisma.eventResource.create({
      data: {
        eventId: resourceData.eventId,
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        url: resourceData.url,
        fileSize: resourceData.fileSize
      }
    });

    return {
      success: true,
      message: 'Resource uploaded successfully',
      data: resource
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get event resources
export const getEventResources = async (eventId: number): Promise<EventResourceResponse> => {
  try {
    const resources = await prisma.eventResource.findMany({
      where: { eventId },
      orderBy: { uploadedAt: 'desc' }
    });

    return {
      success: true,
      data: resources
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Update event resource
export const updateEventResource = async (
  resourceId: number,
  updateData: Partial<EventResourceCreate>
): Promise<EventResourceResponse> => {
  try {
    const resource = await prisma.eventResource.update({
      where: { id: resourceId },
      data: {
        title: updateData.title,
        description: updateData.description,
        type: updateData.type,
        url: updateData.url,
        fileSize: updateData.fileSize
      }
    });

    return {
      success: true,
      message: 'Resource updated successfully',
      data: resource
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Delete event resource
export const deleteEventResource = async (resourceId: number): Promise<EventResourceResponse> => {
  try {
    await prisma.eventResource.delete({
      where: { id: resourceId }
    });

    return {
      success: true,
      message: 'Resource deleted successfully'
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};


