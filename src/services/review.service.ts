import { prisma } from '../lib/prisma';
import { EventReviewCreate, EventReviewResponse, EventReviewStats } from '../types/review.types';

// Create event review
export const createEventReview = async (
  userId: number,
  reviewData: EventReviewCreate
): Promise<EventReviewResponse> => {
  try {
    // Check if event exists and is completed
    const event = await prisma.event.findUnique({
      where: { id: reviewData.eventId }
    });

    if (!event) {
      return {
        success: false,
        message: 'Event not found'
      };
    }

    // Check if user attended the event
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId,
        session: {
          eventId: reviewData.eventId
        }
      }
    });

    if (!attendance) {
      return {
        success: false,
        message: 'You must attend the event to leave a review'
      };
    }

    // Check if review already exists
    const existingReview = await prisma.eventReview.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: reviewData.eventId
        }
      }
    });

    if (existingReview) {
      return {
        success: false,
        message: 'You have already reviewed this event'
      };
    }

    // Validate ratings
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return {
        success: false,
        message: 'Rating must be between 1 and 5'
      };
    }

    const review = await prisma.eventReview.create({
      data: {
        userId,
        eventId: reviewData.eventId,
        rating: reviewData.rating,
        review: reviewData.review,
        contentRating: reviewData.contentRating,
        speakerRating: reviewData.speakerRating,
        organizationRating: reviewData.organizationRating,
        anonymous: reviewData.anonymous || false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            year: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Review submitted successfully',
      data: review
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get event reviews
export const getEventReviews = async (
  eventId: number,
  limit: number = 50
): Promise<EventReviewResponse> => {
  try {
    const reviews = await prisma.eventReview.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: true,
            year: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // Hide user info for anonymous reviews
    const processedReviews = reviews.map(review => ({
      ...review,
      user: review.anonymous ? null : review.user
    }));

    return {
      success: true,
      data: processedReviews
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get event review statistics
export const getEventReviewStats = async (eventId: number): Promise<EventReviewStats> => {
  const reviews = await prisma.eventReview.findMany({
    where: { eventId },
    select: {
      rating: true,
      contentRating: true,
      speakerRating: true,
      organizationRating: true
    }
  });

  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  let totalContentRating = 0;
  let totalSpeakerRating = 0;
  let totalOrganizationRating = 0;
  let contentRatingCount = 0;
  let speakerRatingCount = 0;
  let organizationRatingCount = 0;

  reviews.forEach(review => {
    totalRating += review.rating;
    ratingDistribution[review.rating as keyof typeof ratingDistribution]++;

    if (review.contentRating) {
      totalContentRating += review.contentRating;
      contentRatingCount++;
    }
    if (review.speakerRating) {
      totalSpeakerRating += review.speakerRating;
      speakerRatingCount++;
    }
    if (review.organizationRating) {
      totalOrganizationRating += review.organizationRating;
      organizationRatingCount++;
    }
  });

  return {
    averageRating: parseFloat((totalRating / reviews.length).toFixed(2)),
    totalReviews: reviews.length,
    ratingDistribution,
    averageContentRating: contentRatingCount > 0 
      ? parseFloat((totalContentRating / contentRatingCount).toFixed(2))
      : undefined,
    averageSpeakerRating: speakerRatingCount > 0
      ? parseFloat((totalSpeakerRating / speakerRatingCount).toFixed(2))
      : undefined,
    averageOrganizationRating: organizationRatingCount > 0
      ? parseFloat((totalOrganizationRating / organizationRatingCount).toFixed(2))
      : undefined
  };
};

// Update review
export const updateEventReview = async (
  userId: number,
  reviewId: number,
  updateData: Partial<EventReviewCreate>
): Promise<EventReviewResponse> => {
  try {
    const existingReview = await prisma.eventReview.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return {
        success: false,
        message: 'Review not found'
      };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        message: 'You can only update your own reviews'
      };
    }

    const updatedReview = await prisma.eventReview.update({
      where: { id: reviewId },
      data: {
        rating: updateData.rating,
        review: updateData.review,
        contentRating: updateData.contentRating,
        speakerRating: updateData.speakerRating,
        organizationRating: updateData.organizationRating,
        anonymous: updateData.anonymous
      }
    });

    return {
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Delete review
export const deleteEventReview = async (
  userId: number,
  reviewId: number
): Promise<EventReviewResponse> => {
  try {
    const existingReview = await prisma.eventReview.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      return {
        success: false,
        message: 'Review not found'
      };
    }

    if (existingReview.userId !== userId) {
      return {
        success: false,
        message: 'You can only delete your own reviews'
      };
    }

    await prisma.eventReview.delete({
      where: { id: reviewId }
    });

    return {
      success: true,
      message: 'Review deleted successfully'
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};


