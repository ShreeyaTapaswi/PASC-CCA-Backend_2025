import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma';
import { EmailStatus } from '@prisma/client';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  eventReminder: (data: { eventTitle: string; eventDate: string; location: string; userName: string }) => ({
    subject: `Reminder: ${data.eventTitle} is coming up!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Event Reminder</h2>
        <p>Hi ${data.userName},</p>
        <p>This is a friendly reminder that you have an upcoming event:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.eventTitle}</h3>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  rsvpConfirmation: (data: { eventTitle: string; eventDate: string; location: string; userName: string }) => ({
    subject: `RSVP Confirmed: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">RSVP Confirmed!</h2>
        <p>Hi ${data.userName},</p>
        <p>Your RSVP has been confirmed for:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.eventTitle}</h3>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>See you at the event!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  waitlistPromoted: (data: { eventTitle: string; eventDate: string; location: string; userName: string }) => ({
    subject: `Great News! You've been promoted from the waitlist for ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">You're In!</h2>
        <p>Hi ${data.userName},</p>
        <p>Great news! A spot has opened up and you've been promoted from the waitlist:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.eventTitle}</h3>
          <p><strong>Date:</strong> ${data.eventDate}</p>
          <p><strong>Location:</strong> ${data.location}</p>
        </div>
        <p>Your attendance is now confirmed. See you there!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  attendanceMarked: (data: { eventTitle: string; sessionName: string; credits: number; userName: string }) => ({
    subject: `Attendance Confirmed: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Attendance Marked!</h2>
        <p>Hi ${data.userName},</p>
        <p>Your attendance has been successfully marked for:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${data.eventTitle}</h3>
          <p><strong>Session:</strong> ${data.sessionName}</p>
          <p><strong>Credits Earned:</strong> ${data.credits}</p>
        </div>
        <p>Keep up the great work!</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  waitlistJoined: (data: { eventTitle: string; userName: string }) => ({
    subject: `Waitlisted: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">You're on the Waitlist!</h2>
        <p>Hi ${data.userName},</p>
        <p>The event "${data.eventTitle}" is currently full, and you've been added to the waitlist.</p>
        <p>We'll notify you immediately if a spot opens up and you're promoted.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  rsvpRejected: (data: { eventTitle: string; userName: string }) => ({
    subject: `Update regarding your RSVP for ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">RSVP Update</h2>
        <p>Hi ${data.userName},</p>
        <p>We regret to inform you that your RSVP for "${data.eventTitle}" has been rejected or revoked by the administrator.</p>
        <p>If you have any questions, please contact the coordinator.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),

  announcement: (data: { title: string; message: string; priority: string }) => ({
    subject: `${data.priority === 'URGENT' ? '🚨 URGENT: ' : ''}${data.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${data.priority === 'URGENT' ? '#ef4444' : '#2563eb'};">${data.title}</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${data.message}
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          PICT ACM Student Chapter - CCA Management System
        </p>
      </div>
    `,
  }),
};

// Queue email for sending
export const queueEmail = async (
  to: string,
  template: keyof typeof emailTemplates,
  data: any
): Promise<void> => {
  const emailContent = emailTemplates[template](data);
  
  await prisma.emailQueue.create({
    data: {
      to,
      subject: emailContent.subject,
      body: emailContent.html,
      template,
      data: data as any,
      status: EmailStatus.PENDING,
    },
  });
};

// Send email directly (for immediate sending)
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"PASC CCA" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Process email queue (should be run by a cron job or worker)
export const processEmailQueue = async (batchSize: number = 10): Promise<void> => {
  const pendingEmails = await prisma.emailQueue.findMany({
    where: {
      status: EmailStatus.PENDING,
      attempts: { lt: 3 }, // Max 3 attempts
    },
    take: batchSize,
    orderBy: { createdAt: 'asc' },
  });

  for (const email of pendingEmails) {
    try {
      const success = await sendEmail(email.to, email.subject, email.body);
      
      if (success) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: EmailStatus.SENT,
            sentAt: new Date(),
          },
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: email.attempts >= 2 ? EmailStatus.FAILED : EmailStatus.PENDING,
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
};

// Helper functions for specific email types
export const sendEventReminderEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  location: string
): Promise<void> => {
  await queueEmail(userEmail, 'eventReminder', {
    userName,
    eventTitle,
    eventDate,
    location,
  });
};

export const sendRsvpConfirmationEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  location: string
): Promise<void> => {
  await queueEmail(userEmail, 'rsvpConfirmation', {
    userName,
    eventTitle,
    eventDate,
    location,
  });
};

export const sendWaitlistPromotedEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string,
  eventDate: string,
  location: string
): Promise<void> => {
  await queueEmail(userEmail, 'waitlistPromoted', {
    userName,
    eventTitle,
    eventDate,
    location,
  });
};

export const sendAttendanceMarkedEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string,
  sessionName: string,
  credits: number
): Promise<void> => {
  await queueEmail(userEmail, 'attendanceMarked', {
    userName,
    eventTitle,
    sessionName,
    credits,
  });
};

export const sendWaitlistJoinedEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string
): Promise<void> => {
  await queueEmail(userEmail, 'waitlistJoined', {
    userName,
    eventTitle,
  });
};

export const sendRsvpRejectedEmail = async (
  userEmail: string,
  userName: string,
  eventTitle: string
): Promise<void> => {
  await queueEmail(userEmail, 'rsvpRejected', {
    userName,
    eventTitle,
  });
};

export const sendAnnouncementEmail = async (
  userEmail: string,
  title: string,
  message: string,
  priority: string
): Promise<void> => {
  await queueEmail(userEmail, 'announcement', {
    title,
    message,
    priority,
  });
};


