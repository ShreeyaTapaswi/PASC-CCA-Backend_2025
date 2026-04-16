import { RsvpResponse, RsvpCreate, RsvpWithUser } from '../types/rsvp.types';
import { ApiResponse } from '../types/event.types';
import { prisma } from '../lib/prisma';
import { RsvpStatus } from '@prisma/client';
import { sendRsvpConfirmationEmail, sendWaitlistPromotedEmail, sendWaitlistJoinedEmail, sendRsvpRejectedEmail } from './email.service';
import { notifyRsvpConfirmed, notifyWaitlistPromoted, notifyWaitlistAdded, notifyRsvpRejected } from './notification.service';

export const postrsvp = async (rsvpData: RsvpCreate, userId: number): Promise<RsvpResponse> => {
  const startTime = Date.now();
  console.log(`[RSVP REQUEST] userId: ${userId}, eventId: ${rsvpData.eventId}`);
  let notificationPayload: any = null;

  try {
    const { rsvp, status } = await prisma.$transaction(async (tx) => {
      console.log(`[TRANSACTION START]`);

      // Verify event is active (checking status only without reading capacity)
      const eventStatusCheck = await tx.event.findUnique({
        where: { id: rsvpData.eventId },
        select: { status: true }
      });

      if (!eventStatusCheck) throw new Error('NO_SUCH_EVENT');
      if (eventStatusCheck.status !== 'UPCOMING' && eventStatusCheck.status !== 'ONGOING') {
        throw new Error('INVALID_EVENT_STATUS');
      }

      // 1. Check existing RSVP
      const existingRsvp = await tx.rsvp.findUnique({
        where: { userId_eventId: { userId, eventId: rsvpData.eventId } }
      });
      if (existingRsvp) throw new Error('DUPLICATE_RSVP');

      // FIRST: atomic capacity update
      const updateResult = await tx.event.updateMany({
        where: {
          id: rsvpData.eventId,
          capacity: { gt: 0 },
        },
        data: {
          capacity: { decrement: 1 }
        }
      });

      const assignedStatus = updateResult.count === 1 ? RsvpStatus.CONFIRMED : RsvpStatus.WAITLISTED;

      // SECOND: RSVP creation
      const createdRsvp = await tx.rsvp.create({
        data: {
          eventId: rsvpData.eventId,
          userId,
          status: assignedStatus,
          waitlisted: assignedStatus === 'WAITLISTED'
        }
      });

      return { rsvp: createdRsvp, status: assignedStatus };
    }, { timeout: 3000 });

    // Strong invariant checks after transaction
    const finalEvent = await prisma.event.findUnique({
      where: { id: rsvpData.eventId },
      select: { id: true, capacity: true, title: true, startDate: true, location: true }
    });

    if (!finalEvent) throw new Error('Post-transaction event not found');

    if (finalEvent.capacity < 0) {
      console.warn(`[WARNING] Event ${finalEvent.id} capacity is negative (${finalEvent.capacity}) due to admin overrides.`);
    }

    const confirmedCount = await prisma.rsvp.count({
      where: { eventId: finalEvent.id, status: 'CONFIRMED' }
    });
    // For logging, since we don't have maxCapacity directly preserved:
    console.log(`[DEBUG] Event ${finalEvent.id} has ${confirmedCount} confirmed RSVPs and ${finalEvent.capacity} remaining capacity.`);

    // Deterministic Waitlist Position computation
    let waitlistPosition: number | undefined = undefined;
    if (status === 'WAITLISTED') {
      const precedingWaitlisted = await prisma.rsvp.count({
        where: {
          eventId: rsvpData.eventId,
          status: RsvpStatus.WAITLISTED,
          OR: [
            { createdAt: { lt: rsvp.createdAt } },
            { createdAt: rsvp.createdAt, id: { lte: rsvp.id } }
          ]
        }
      });
      waitlistPosition = precedingWaitlisted;
    }

    // Fail-safe Logging
    const duration = Date.now() - startTime;
    console.log(`[TRANSACTION END] Event updated. Assigned status: ${status}. Final capacity: ${finalEvent.capacity}. Duration: ${duration}ms`);

    // Notifications preparation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, id: true }
    });

    if (user) {
      const eventDate = finalEvent.startDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      if (status === 'WAITLISTED') {
        sendWaitlistJoinedEmail(user.email, user.name || 'Student', finalEvent.title).catch(console.error);
        notifyWaitlistAdded(user.id, finalEvent.id, finalEvent.title).catch(console.error);
      } else {
        sendRsvpConfirmationEmail(user.email, user.name || 'Student', finalEvent.title, eventDate, finalEvent.location).catch(console.error);
        notifyRsvpConfirmed(user.id, finalEvent.id, finalEvent.title).catch(console.error);
      }
    }

    return {
      success: true,
      message: status === RsvpStatus.WAITLISTED ? 'Added to waitlist' : 'RSVP confirmed successfully',
      data: {
        status,
        remainingCapacity: finalEvent.capacity,
        waitlistPosition
      }
    };
  } catch (error: any) {
    console.error('[RSVP Critical Error]:', error.message || error);
    return {
      success: false,
      message: error.message === 'DUPLICATE_RSVP' ? 'RSVP already exists' 
             : error.message === 'NO_SUCH_EVENT' ? 'NO SUCH EVENT PRESENT'
             : error.message === 'INVALID_EVENT_STATUS' ? 'RSVP is only allowed for UPCOMING or ONGOING events'
             : 'Internal server error while processing RSVP'
    };
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
  console.log(`[RSVP Action] User ${userId} deleting RSVP ${rsvpId}`);
  let notificationPayload: any = null;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingRsvp = await tx.rsvp.findFirst({
        where: { id: rsvpId, userId: userId },
        include: { event: true }
      });

      if (!existingRsvp) {
        return { success: false, message: 'RSVP not found' };
      }

      const wasConfirmed = existingRsvp.status === RsvpStatus.CONFIRMED;
      const eventId = existingRsvp.eventId;

      await tx.rsvp.delete({
        where: { id: rsvpId }
      });

      // If it was confirmed and event is relevant, increment capacity or promote
      if (wasConfirmed && (existingRsvp.event.status === 'UPCOMING' || existingRsvp.event.status === 'ONGOING')) {
        const promotionResult = await promoteFromWaitlistInternal(eventId, tx);
        if (!promotionResult.promoted) {
          // No one to promote, increment capacity back
          await tx.event.update({
            where: { id: eventId },
            data: { capacity: { increment: 1 } }
          });
          console.log(`[RSVP Success] RSVP deleted. Capacity incremented for Event ${eventId}`);
        } else {
          notificationPayload = promotionResult.payload;
        }
      }

      return {
        success: true,
        message: 'RSVP deleted successfully',
        data: {
          ...existingRsvp,
          waitlistPosition: undefined
        }
      };
    }, { timeout: 3000 });

    if (result.success && notificationPayload) {
      const { user, event } = notificationPayload;
      const eventDate = event.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      sendWaitlistPromotedEmail(
        user.email,
        user.name || 'Student',
        event.title,
        eventDate,
        event.location
      ).catch(console.error);
      notifyWaitlistPromoted(user.id, event.id, event.title).catch(console.error);
    }

    return result;
  } catch (error) {
    console.error('[RSVP Critical Error deletions]:', error);
    return { success: false, message: 'Failed to delete RSVP' };
  }
};

// Helper function to promote from waitlist (internal version with transaction)
const promoteFromWaitlistInternal = async (eventId: number, tx: any): Promise<{ promoted: boolean, payload?: any }> => {
  const nextInWaitlist = await tx.rsvp.findFirst({
    where: { eventId, status: RsvpStatus.WAITLISTED },
    orderBy: { createdAt: 'asc' },
    include: { user: true, event: true }
  });

  if (!nextInWaitlist) return { promoted: false };

  // Check event status
  if (nextInWaitlist.event.status !== 'UPCOMING' && nextInWaitlist.event.status !== 'ONGOING') {
    return { promoted: false };
  }

  // Promote from waitlist
  await tx.rsvp.update({
    where: { id: nextInWaitlist.id },
    data: {
      status: RsvpStatus.CONFIRMED,
      waitlisted: false,
    }
  });

  return { promoted: true, payload: { user: nextInWaitlist.user, event: nextInWaitlist.event } };
};

// Public helper for promotion (wraps internal with its own transaction)
export const promoteFromWaitlist = async (eventId: number): Promise<void> => {
  let notificationPayload: any = null;

  await prisma.$transaction(async (tx) => {
    const promotionResult = await promoteFromWaitlistInternal(eventId, tx);
    if (promotionResult.promoted) {
      notificationPayload = promotionResult.payload;
    }
  }, { timeout: 3000 });

  if (notificationPayload) {
    const { user, event } = notificationPayload;
    const eventDate = event.startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    sendWaitlistPromotedEmail(
      user.email,
      user.name || 'Student',
      event.title,
      eventDate,
      event.location
    ).catch(console.error);
    notifyWaitlistPromoted(user.id, event.id, event.title).catch(console.error);
  }
};

export const adminApproveRsvp = async (rsvpId: number, overrideCapacity: boolean = true): Promise<RsvpResponse> => {
  console.log(`[Admin Tool] Approving RSVP ${rsvpId}, Override: ${overrideCapacity}`);
  let notificationPayload: any = null;

  try {
    const { updatedRsvp } = await prisma.$transaction(async (tx) => {
      const rsvp = await tx.rsvp.findUnique({
        where: { id: rsvpId },
        include: { event: true, user: true }
      });

      if (!rsvp) throw new Error('RSVP_NOT_FOUND');
      if (rsvp.status !== RsvpStatus.WAITLISTED) throw new Error('INVALID_STATUS');
      if (rsvp.event.status !== 'UPCOMING' && rsvp.event.status !== 'ONGOING') {
        throw new Error('INVALID_EVENT_STATUS');
      }

      if (overrideCapacity) {
        await tx.event.update({
          where: { id: rsvp.eventId },
          data: { capacity: { decrement: 1 } }
        });
      } else {
        const updateResult = await tx.event.updateMany({
          where: {
            id: rsvp.eventId,
            capacity: { gt: 0 },
            status: { in: ['UPCOMING', 'ONGOING'] }
          },
          data: { capacity: { decrement: 1 } }
        });

        if (updateResult.count === 0) {
          throw new Error('EVENT_FULL');
        }
      }

      const updated = await tx.rsvp.update({
        where: { id: rsvpId },
        data: {
          status: RsvpStatus.CONFIRMED,
          waitlisted: false,
        }
      });

      notificationPayload = { ...rsvp };
      return { updatedRsvp: updated };
    }, { timeout: 3000 });

    if (notificationPayload) {
      const { user, event } = notificationPayload;
      const eventDate = event.startDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      sendRsvpConfirmationEmail(user.email, user.name || 'Student', event.title, eventDate, event.location).catch(console.error);
      notifyRsvpConfirmed(user.id, event.id, event.title).catch(console.error);
    }

    const remainingEvent = await prisma.event.findUnique({ where: { id: notificationPayload.eventId } });

    return { 
      success: true, 
      message: 'RSVP approved successfully', 
      data: {
        status: updatedRsvp.status,
        remainingCapacity: remainingEvent?.capacity || 0
      }
    };
  } catch (error: any) {
    console.error('[Admin Critical Error approvals]:', error);
    return {
      success: false,
      message: error.message === 'EVENT_FULL' ? 'Event is at full capacity. Use override to force approval.' :
               error.message === 'INVALID_STATUS' ? 'Only waitlisted RSVPs can be approved' :
               error.message === 'RSVP_NOT_FOUND' ? 'RSVP not found' : error.message
    };
  }
};

export const adminRejectRsvp = async (rsvpId: number): Promise<RsvpResponse> => {
  console.log(`[Admin Action] Rejecting RSVP ${rsvpId}`);
  let notificationPayload: any = null;

  try {
    const { updatedRsvp } = await prisma.$transaction(async (tx) => {
      const rsvp = await tx.rsvp.findUnique({
        where: { id: rsvpId },
        include: { event: true }
      });

      if (!rsvp) throw new Error('RSVP_NOT_FOUND');

      const wasConfirmed = rsvp.status === RsvpStatus.CONFIRMED;
      const eventId = rsvp.eventId;

      const updated = await tx.rsvp.update({
        where: { id: rsvpId },
        data: {
          status: RsvpStatus.REJECTED,
          waitlisted: false,
        }
      });

      // If it was confirmed, promote or increment
      if (wasConfirmed && (rsvp.event.status === 'UPCOMING' || rsvp.event.status === 'ONGOING')) {
        const promoted = await promoteFromWaitlistInternal(eventId, tx);
        if (!promoted.promoted) {
          await tx.event.update({
            where: { id: eventId },
            data: { capacity: { increment: 1 } }
          });
        } else {
          // If promoted successfully, load notification payload for the promoted user
          notificationPayload = promoted.payload;
        }
      }

      const user = await tx.user.findUnique({
        where: { id: rsvp.userId },
        select: { email: true, name: true, id: true }
      });

      return { updatedRsvp: updated, userRejected: user, eventRejected: rsvp.event };
    }, { timeout: 3000 });

    // Handle notifications outside
    // First, notification for the primary rejected user
    const { user: userRejected, event: eventRejected } = (await prisma.rsvp.findUnique({ where: { id: rsvpId }, include: { user: true, event: true } })) || {};
    if (userRejected && eventRejected) {
      sendRsvpRejectedEmail(userRejected.email, userRejected.name || 'Student', eventRejected.title).catch(console.error);
      notifyRsvpRejected(userRejected.id, eventRejected.id, eventRejected.title).catch(console.error);
    }

    // Second, notification for promoted user if any
    if (notificationPayload) {
      const { user, event } = notificationPayload;
      const eventDate = event.startDate.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      sendWaitlistPromotedEmail(user.email, user.name || 'Student', event.title, eventDate, event.location).catch(console.error);
      notifyWaitlistPromoted(user.id, event.id, event.title).catch(console.error);
    }

    return { success: true, message: 'RSVP rejected successfully', data: { ...updatedRsvp, waitlistPosition: undefined } };
  } catch (error: any) {
    console.error('[Admin Critical Error rejections]:', error);
    return { success: false, message: error.message === 'RSVP_NOT_FOUND' ? 'RSVP not found' : error.message };
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