"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyAnnouncement = exports.notifyAttendanceMarked = exports.notifyWaitlistPromoted = exports.notifyRsvpConfirmed = exports.notifyEventReminder = exports.deleteOldNotifications = exports.getUnreadNotificationCount = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getUserNotifications = exports.createBulkNotifications = exports.createNotification = void 0;
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
// Create a notification
const createNotification = async (input) => {
    return await prisma_1.prisma.notification.create({
        data: {
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data || {},
        },
    });
};
exports.createNotification = createNotification;
// Create notifications for multiple users
const createBulkNotifications = async (userIds, type, title, message, data) => {
    const notifications = userIds.map((userId) => ({
        userId,
        type,
        title,
        message,
        data: data || {},
    }));
    return await prisma_1.prisma.notification.createMany({
        data: notifications,
    });
};
exports.createBulkNotifications = createBulkNotifications;
// Get user notifications
const getUserNotifications = async (userId, unreadOnly = false, limit = 50) => {
    return await prisma_1.prisma.notification.findMany({
        where: {
            userId,
            ...(unreadOnly && { read: false }),
        },
        orderBy: { sentAt: 'desc' },
        take: limit,
    });
};
exports.getUserNotifications = getUserNotifications;
// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
    return await prisma_1.prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId,
        },
        data: {
            read: true,
            readAt: new Date(),
        },
    });
};
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read
const markAllNotificationsAsRead = async (userId) => {
    return await prisma_1.prisma.notification.updateMany({
        where: {
            userId,
            read: false,
        },
        data: {
            read: true,
            readAt: new Date(),
        },
    });
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Get unread notification count
const getUnreadNotificationCount = async (userId) => {
    return await prisma_1.prisma.notification.count({
        where: {
            userId,
            read: false,
        },
    });
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
// Delete old notifications (cleanup job)
const deleteOldNotifications = async (daysOld = 90) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return await prisma_1.prisma.notification.deleteMany({
        where: {
            sentAt: { lt: cutoffDate },
            read: true,
        },
    });
};
exports.deleteOldNotifications = deleteOldNotifications;
// Helper functions for specific notification types
const notifyEventReminder = async (userId, eventId, eventTitle) => {
    return await (0, exports.createNotification)({
        userId,
        type: client_1.NotificationType.EVENT_REMINDER,
        title: 'Event Reminder',
        message: `${eventTitle} is coming up soon!`,
        data: { eventId },
    });
};
exports.notifyEventReminder = notifyEventReminder;
const notifyRsvpConfirmed = async (userId, eventId, eventTitle) => {
    return await (0, exports.createNotification)({
        userId,
        type: client_1.NotificationType.RSVP_CONFIRMED,
        title: 'RSVP Confirmed',
        message: `Your RSVP for ${eventTitle} has been confirmed.`,
        data: { eventId },
    });
};
exports.notifyRsvpConfirmed = notifyRsvpConfirmed;
const notifyWaitlistPromoted = async (userId, eventId, eventTitle) => {
    return await (0, exports.createNotification)({
        userId,
        type: client_1.NotificationType.WAITLIST_PROMOTED,
        title: 'Promoted from Waitlist!',
        message: `Great news! You've been promoted from the waitlist for ${eventTitle}.`,
        data: { eventId },
    });
};
exports.notifyWaitlistPromoted = notifyWaitlistPromoted;
const notifyAttendanceMarked = async (userId, eventId, eventTitle, credits) => {
    return await (0, exports.createNotification)({
        userId,
        type: client_1.NotificationType.ATTENDANCE_MARKED,
        title: 'Attendance Marked',
        message: `Your attendance for ${eventTitle} has been marked. You earned ${credits} credits!`,
        data: { eventId, credits },
    });
};
exports.notifyAttendanceMarked = notifyAttendanceMarked;
const notifyAnnouncement = async (userId, announcementId, title) => {
    return await (0, exports.createNotification)({
        userId,
        type: client_1.NotificationType.ANNOUNCEMENT,
        title: 'New Announcement',
        message: title,
        data: { announcementId },
    });
};
exports.notifyAnnouncement = notifyAnnouncement;
