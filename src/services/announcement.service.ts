import { prisma } from '../lib/prisma';
import { AnnouncementCreate, AnnouncementResponse } from '../types/announcement.types';
import { AnnouncementPriority, Department, Prisma } from '@prisma/client';
import { sendAnnouncementEmail } from './email.service';
import { notifyAnnouncement } from './notification.service';

// Create announcement
export const createAnnouncement = async (
  adminId: number,
  announcementData: AnnouncementCreate
): Promise<AnnouncementResponse> => {
  try {
    const announcement = await prisma.announcement.create({
      data: {
        adminId,
        title: announcementData.title,
        message: announcementData.message,
        priority: announcementData.priority || AnnouncementPriority.NORMAL,
        targetAudience: announcementData.targetAudience || {},
        expiresAt: announcementData.expiresAt
      }
    });

    // Get target users
    const targetUsers = await getTargetUsers(announcementData.targetAudience);

    // Send notifications and emails asynchronously
    setImmediate(async () => {
      for (const user of targetUsers) {
        // Create in-app notification
        await notifyAnnouncement(user.id, announcement.id, announcement.title);

        // Queue email
        await sendAnnouncementEmail(
          user.email,
          announcement.title,
          announcement.message,
          announcement.priority
        );
      }
    });

    return {
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get target users based on audience criteria
const getTargetUsers = async (targetAudience?: any) => {
  const where: any = {};

  if (targetAudience) {
    if (targetAudience.departments && targetAudience.departments.length > 0) {
      where.department = { in: targetAudience.departments };
    }
    if (targetAudience.years && targetAudience.years.length > 0) {
      where.year = { in: targetAudience.years };
    }
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      name: true
    }
  });
};

// Get announcements for user
export const getUserAnnouncements = async (
  userId: number,
  includeRead: boolean = false,
  limit: number = 50
): Promise<AnnouncementResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { department: true, year: true }
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    const currentDate = new Date();

    // Get announcements that match user's profile
    const announcements = await prisma.announcement.findMany({
      where: {
        AND: [
        {
          OR: [
            { targetAudience: { equals: Prisma.JsonNull } }, // Global announcements
            { targetAudience: { equals: {} } }, // Empty target
              {
                AND: [
                  {
                    OR: [
                      { targetAudience: { path: ['departments'], array_contains: user.department } },
                      { targetAudience: { path: ['departments'], equals: Prisma.JsonNull } }
                    ]
                  },
                  {
                    OR: [
                      { targetAudience: { path: ['years'], array_contains: user.year } },
                      { targetAudience: { path: ['years'], equals: Prisma.JsonNull } }
                    ]
                  }
                ]
              }
            ]
          },
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: currentDate } }
            ]
          }
        ]
      },
      include: {
        readBy: {
          where: { userId },
          select: { readAt: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    // Filter out read announcements if needed
    let filteredAnnouncements = announcements;
    if (!includeRead) {
      filteredAnnouncements = announcements.filter(a => (a as any).readBy.length === 0);
    }

    const processedAnnouncements = filteredAnnouncements.map(a => ({
      ...a,
      isRead: (a as any).readBy.length > 0,
      readAt: (a as any).readBy[0]?.readAt || null
    }));

    return {
      success: true,
      data: processedAnnouncements
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get all announcements (admin)
export const getAllAnnouncements = async (limit: number = 100): Promise<AnnouncementResponse> => {
  try {
    const announcements = await prisma.announcement.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            readBy: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return {
      success: true,
      data: announcements
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Mark announcement as read
export const markAnnouncementAsRead = async (
  userId: number,
  announcementId: number
): Promise<AnnouncementResponse> => {
  try {
    await prisma.userAnnouncementRead.upsert({
      where: {
        userId_announcementId: {
          userId,
          announcementId
        }
      },
      create: {
        userId,
        announcementId
      },
      update: {
        readAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Announcement marked as read'
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Update announcement
export const updateAnnouncement = async (
  announcementId: number,
  updateData: Partial<AnnouncementCreate>
): Promise<AnnouncementResponse> => {
  try {
    const announcement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: updateData.title,
        message: updateData.message,
        priority: updateData.priority,
        targetAudience: updateData.targetAudience,
        expiresAt: updateData.expiresAt
      }
    });

    return {
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (announcementId: number): Promise<AnnouncementResponse> => {
  try {
    await prisma.announcement.delete({
      where: { id: announcementId }
    });

    return {
      success: true,
      message: 'Announcement deleted successfully'
    };
  } catch (error) {
    console.error('Service error:', error);
    throw error;
  }
};

// Get unread announcement count
export const getUnreadAnnouncementCount = async (userId: number): Promise<number> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { department: true, year: true }
  });

  if (!user) return 0;

  const currentDate = new Date();

  const unreadCount = await prisma.announcement.count({
    where: {
      AND: [
        {
          OR: [
            { targetAudience: { equals: Prisma.JsonNull } },
            { targetAudience: { equals: {} } },
            {
              AND: [
                {
                  OR: [
                    { targetAudience: { path: ['departments'], array_contains: user.department } },
                    { targetAudience: { path: ['departments'], equals: Prisma.JsonNull } }
                  ]
                },
                {
                  OR: [
                    { targetAudience: { path: ['years'], array_contains: user.year } },
                    { targetAudience: { path: ['years'], equals: Prisma.JsonNull } }
                  ]
                }
              ]
            }
          ]
        },
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: currentDate } }
          ]
        }
      ],
      readBy: {
        none: {
          userId
        }
      }
    }
  });

  return unreadCount;
};


