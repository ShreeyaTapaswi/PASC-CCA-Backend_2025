"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRsvp = exports.deleteRsvpById = exports.getRsvpsByEventId = exports.findRsvpByEventId = exports.getRsvpByEventId = exports.getUserRsvps = exports.postrsvp = void 0;
const prisma_1 = require("../lib/prisma");
const email_service_1 = require("./email.service");
const notification_service_1 = require("./notification.service");
const postrsvp = async (rsvpData, userId) => {
    try {
        const event = await prisma_1.prisma.event.findUnique({
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
        const existingRsvp = await prisma_1.prisma.rsvp.findUnique({
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
            const waitlistCount = await prisma_1.prisma.rsvp.count({
                where: {
                    eventId: rsvpData.eventId,
                    waitlisted: true
                }
            });
            waitlisted = true;
            waitlistPosition = waitlistCount + 1;
        }
        const result = await prisma_1.prisma.rsvp.create({
            data: {
                ...rsvpData,
                userId: userId,
                waitlisted,
                waitlistPosition
            }
        });
        // Get user details for email
        const user = await prisma_1.prisma.user.findUnique({
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
                await (0, notification_service_1.notifyRsvpConfirmed)(userId, event.id, event.title);
            }
            else {
                // Send confirmation email and notification
                await (0, email_service_1.sendRsvpConfirmationEmail)(user.email, user.name || 'Student', event.title, eventDate, event.location);
                await (0, notification_service_1.notifyRsvpConfirmed)(userId, event.id, event.title);
            }
        }
        return {
            success: true,
            message: waitlisted
                ? `Added to waitlist (Position: ${waitlistPosition})`
                : 'RSVP created successfully',
            data: result
        };
    }
    catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};
exports.postrsvp = postrsvp;
const getUserRsvps = async (userId) => {
    try {
        const rsvps = await prisma_1.prisma.rsvp.findMany({
            where: { userId },
            include: {
                event: true
            },
        });
        return {
            success: true,
            data: rsvps
        };
    }
    catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};
exports.getUserRsvps = getUserRsvps;
const getRsvpByEventId = async (userId, eventId) => {
    try {
        const rsvp = await prisma_1.prisma.rsvp.findUnique({
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
    }
    catch (error) {
        console.error('Service error:', error);
        throw error;
    }
};
exports.getRsvpByEventId = getRsvpByEventId;
const findRsvpByEventId = async (eventId) => {
    if (isNaN(eventId)) {
        throw new Error('Invalid event ID');
    }
    const rsvp = await prisma_1.prisma.rsvp.findFirst({
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
exports.findRsvpByEventId = findRsvpByEventId;
const getRsvpsByEventId = async (eventId) => {
    const event = await prisma_1.prisma.event.findUnique({
        where: { id: eventId },
    });
    if (!event) {
        return {
            success: false,
            message: 'Event not found',
            data: undefined
        };
    }
    const rsvps = await prisma_1.prisma.rsvp.findMany({
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
exports.getRsvpsByEventId = getRsvpsByEventId;
const deleteRsvpById = async (userId, rsvpId) => {
    try {
        const existingRsvp = await prisma_1.prisma.rsvp.findFirst({
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
        await prisma_1.prisma.rsvp.delete({
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
    }
    catch (error) {
        console.error('Service error deleting RSVP:', error);
        return {
            success: false,
            message: 'Failed to delete RSVP',
            data: undefined
        };
    }
};
exports.deleteRsvpById = deleteRsvpById;
// Helper function to promote from waitlist
const promoteFromWaitlist = async (eventId) => {
    const nextInWaitlist = await prisma_1.prisma.rsvp.findFirst({
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
        await prisma_1.prisma.rsvp.update({
            where: { id: nextInWaitlist.id },
            data: {
                waitlisted: false,
                waitlistPosition: null
            }
        });
        // Update positions for remaining waitlist
        await prisma_1.prisma.rsvp.updateMany({
            where: {
                eventId,
                waitlisted: true,
                waitlistPosition: { gt: nextInWaitlist.waitlistPosition }
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
        await (0, email_service_1.sendWaitlistPromotedEmail)(nextInWaitlist.user.email, nextInWaitlist.user.name || 'Student', nextInWaitlist.event.title, eventDate, nextInWaitlist.event.location);
        await (0, notification_service_1.notifyWaitlistPromoted)(nextInWaitlist.userId, nextInWaitlist.eventId, nextInWaitlist.event.title);
    }
};
const UpdateRsvp = async (userId, eventId, status) => {
    try {
        const existingRsvp = await prisma_1.prisma.rsvp.findUnique({
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
        const updatedRsvp = await prisma_1.prisma.rsvp.update({
            where: { id: existingRsvp.id },
            data: { status }
        });
        return {
            success: true,
            message: "RSVP updated successfully",
            data: updatedRsvp
        };
    }
    catch (error) {
        console.error("Service error updating RSVP:", error);
        return {
            success: false,
            message: "Failed to update RSVP",
            data: undefined
        };
    }
};
exports.UpdateRsvp = UpdateRsvp;
