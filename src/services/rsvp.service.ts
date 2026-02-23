import { RsvpResponse, RsvpCreate, RsvpWithUser, RsvpStatus } from '../types/rsvp.types';
import { ApiResponse } from '../types/event.types';
import { prisma } from '../lib/prisma';
import { sendRsvpConfirmationEmail, sendWaitlistPromotedEmail } from './email.service';
import { notifyRsvpConfirmed, notifyWaitlistPromoted } from './notification.service';

export const postrsvp = async (rsvpData: RsvpCreate, userId: number): Promise<RsvpResponse> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: rsvpData.eventId
      },
      include: {
        rsvps: {
          where: {
            status: 'ATTENDING',
            waitlisted: false
          }
        }
      }
    });

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

    // Check capacity
    const confirmedRsvpCount = event.rsvps.length;
    const isAtCapacity = confirmedRsvpCount >= event.capacity;

    let waitlisted = false;
    let waitlistPosition = null;

    if (isAtCapacity && rsvpData.status === 'ATTENDING') {
      // Add to waitlist
      const waitlistCount = await prisma.rsvp.count({
        where: {
          eventId: rsvpData.eventId,
          waitlisted: true
        }
      });
      waitlisted = true;
      waitlistPosition = waitlistCount + 1;
    }

    const result = await prisma.rsvp.create({
      data: {
        ...rsvpData,
        userId: userId,
        waitlisted,
        waitlistPosition
      }
    });

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (user) {
      const eventDate = event.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (waitlisted) {
        // Send notification about waitlist
        await notifyRsvpConfirmed(userId, event.id, event.title);
      } else {
        // Send confirmation email and notification
        await sendRsvpConfirmationEmail(
          user.email,
          user.name || 'Student',
          event.title,
          eventDate,
          event.location
        );
        await notifyRsvpConfirmed(userId, event.id, event.title);
      }
    }

    return {
      success: true,
      message: waitlisted
        ? `Added to waitlist (Position: ${waitlistPosition})`
        : 'RSVP created successfully',
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


export const deleteRsvpById = async (userId: number, rsvpId: number): Promise<RsvpResponse> => {
  try {
    const existingRsvp = await prisma.rsvp.findFirst({
      where: { id: rsvpId, userId: userId },
      include: { event: true }
    });
    if (!existingRsvp) {
      return {
        success: false,
        message: 'RSVP not found',
        data: undefined
      };
    }

    const wasConfirmed = existingRsvp.status === 'ATTENDING' && !existingRsvp.waitlisted;

    await prisma.rsvp.delete({
      where: { id: rsvpId }
    });

    // If this was a confirmed RSVP, promote someone from waitlist
    if (wasConfirmed) {
      await promoteFromWaitlist(existingRsvp.eventId);
    }

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

// Helper function to promote from waitlist
const promoteFromWaitlist = async (eventId: number): Promise<void> => {
  const nextInWaitlist = await prisma.rsvp.findFirst({
    where: {
      eventId,
      waitlisted: true,
      status: 'ATTENDING'
    },
    orderBy: {
      waitlistPosition: 'asc'
    },
    include: {
      user: true,
      event: true
    }
  });

  if (nextInWaitlist) {
    // Promote from waitlist
    await prisma.rsvp.update({
      where: { id: nextInWaitlist.id },
      data: {
        waitlisted: false,
        waitlistPosition: null
      }
    });

    // Update positions for remaining waitlist
    await prisma.rsvp.updateMany({
      where: {
        eventId,
        waitlisted: true,
        waitlistPosition: { gt: nextInWaitlist.waitlistPosition! }
      },
      data: {
        waitlistPosition: { decrement: 1 }
      }
    });

    // Send notification and email
    const eventDate = nextInWaitlist.event.startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    await sendWaitlistPromotedEmail(
      nextInWaitlist.user.email,
      nextInWaitlist.user.name || 'Student',
      nextInWaitlist.event.title,
      eventDate,
      nextInWaitlist.event.location
    );

    await notifyWaitlistPromoted(
      nextInWaitlist.userId,
      nextInWaitlist.eventId,
      nextInWaitlist.event.title
    );
  }
};

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