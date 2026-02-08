import { prisma } from '../lib/prisma';

export interface EventGalleryCreate {
  eventId: number;
  imageUrl: string;
  caption?: string;
}

export interface EventGalleryResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Add image to event gallery
export const addEventGalleryImage = async (
  galleryData: EventGalleryCreate
): Promise<EventGalleryResponse> => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: galleryData.eventId }
    });

    if (!event) {
      return {
        success: false,
        message: 'Event not found'
      };
    }

    const galleryImage = await prisma.eventGallery.create({
      data: {
        eventId: galleryData.eventId,
        imageUrl: galleryData.imageUrl,
        caption: galleryData.caption
      }
    });

    return {
      success: true,
      message: 'Image added to gallery successfully',
      data: galleryImage
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get event gallery
export const getEventGallery = async (eventId: number): Promise<EventGalleryResponse> => {
  try {
    const gallery = await prisma.eventGallery.findMany({
      where: { eventId },
      orderBy: { uploadedAt: 'desc' }
    });

    return {
      success: true,
      data: gallery
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Update gallery image
export const updateEventGalleryImage = async (
  imageId: number,
  caption: string
): Promise<EventGalleryResponse> => {
  try {
    const image = await prisma.eventGallery.update({
      where: { id: imageId },
      data: { caption }
    });

    return {
      success: true,
      message: 'Caption updated successfully',
      data: image
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Delete gallery image
export const deleteEventGalleryImage = async (imageId: number): Promise<EventGalleryResponse> => {
  try {
    await prisma.eventGallery.delete({
      where: { id: imageId }
    });

    return {
      success: true,
      message: 'Image deleted successfully'
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get all gallery images (for homepage/feed)
export const getAllGalleryImages = async (limit: number = 50): Promise<EventGalleryResponse> => {
  try {
    const images = await prisma.eventGallery.findMany({
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' },
      take: limit
    });

    return {
      success: true,
      data: images
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};


