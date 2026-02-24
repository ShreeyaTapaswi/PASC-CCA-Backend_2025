import { prisma } from '../lib/prisma';
import { NotificationType } from '@prisma/client';

/** Notifications older than this (days) are deleted to prevent table overflow. */
export const NOTIFICATION_EXPIRY_DAYS = 2;

export interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

// Create a notification
export const createNotification = async (input: CreateNotificationInput) => {
  return await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || {},
    },
  });
};

// Create notifications for multiple users
export const createBulkNotifications = async (
  userIds: number[],
  type: NotificationType,
  title: string,
  message: string,
  data?: any
) => {
  const notifications = userIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    data: data || {},
  }));

  return await prisma.notification.createMany({
    data: notifications,
  });
};

// Get user notifications
export const getUserNotifications = async (
  userId: number,
  unreadOnly: boolean = false,
  limit: number = 50
) => {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { read: false }),
    },
    orderBy: { sentAt: 'desc' },
    take: limit,
  });
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: number, userId: number) => {
  return await prisma.notification.updateMany({
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

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: number) => {
  return await prisma.notification.updateMany({
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

// Get unread notification count
export const getUnreadNotificationCount = async (userId: number): Promise<number> => {
  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
};

// Delete old notifications (cleanup job) – prevents table overflow
export const deleteOldNotifications = async (daysOld: number = NOTIFICATION_EXPIRY_DAYS) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return await prisma.notification.deleteMany({
    where: {
      sentAt: { lt: cutoffDate },
    },
  });
};

// Helper functions for specific notification types
export const notifyEventReminder = async (userId: number, eventId: number, eventTitle: string) => {
  return await createNotification({
    userId,
    type: NotificationType.EVENT_REMINDER,
    title: 'Event Reminder',
    message: `${eventTitle} is coming up soon!`,
    data: { eventId },
  });
};

export const notifyRsvpConfirmed = async (userId: number, eventId: number, eventTitle: string) => {
  return await createNotification({
    userId,
    type: NotificationType.RSVP_CONFIRMED,
    title: 'RSVP Confirmed',
    message: `Your RSVP for ${eventTitle} has been confirmed.`,
    data: { eventId },
  });
};

export const notifyWaitlistPromoted = async (userId: number, eventId: number, eventTitle: string) => {
  return await createNotification({
    userId,
    type: NotificationType.WAITLIST_PROMOTED,
    title: 'Promoted from Waitlist!',
    message: `Great news! You've been promoted from the waitlist for ${eventTitle}.`,
    data: { eventId },
  });
};

export const notifyAttendanceMarked = async (
  userId: number,
  eventId: number,
  eventTitle: string,
  credits: number
) => {
  return await createNotification({
    userId,
    type: NotificationType.ATTENDANCE_MARKED,
    title: 'Attendance Marked',
    message: `Your attendance for ${eventTitle} has been marked. You earned ${credits} credits!`,
    data: { eventId, credits },
  });
};

export const notifyAnnouncement = async (userId: number, announcementId: number, title: string) => {
  return await createNotification({
    userId,
    type: NotificationType.ANNOUNCEMENT,
    title: 'New Announcement',
    message: title,
    data: { announcementId },
  });
};


