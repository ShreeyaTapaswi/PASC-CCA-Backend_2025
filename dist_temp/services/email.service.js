"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAnnouncementEmail = exports.sendAttendanceMarkedEmail = exports.sendWaitlistPromotedEmail = exports.sendRsvpConfirmationEmail = exports.sendEventReminderEmail = exports.processEmailQueue = exports.sendEmail = exports.queueEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = require("../lib/prisma");
const client_1 = require("@prisma/client");
// Email transporter configuration
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
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
    eventReminder: (data) => ({
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
    rsvpConfirmation: (data) => ({
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
    waitlistPromoted: (data) => ({
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
    attendanceMarked: (data) => ({
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
    announcement: (data) => ({
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
const queueEmail = async (to, template, data) => {
    const emailContent = emailTemplates[template](data);
    await prisma_1.prisma.emailQueue.create({
        data: {
            to,
            subject: emailContent.subject,
            body: emailContent.html,
            template,
            data: data,
            status: client_1.EmailStatus.PENDING,
        },
    });
};
exports.queueEmail = queueEmail;
// Send email directly (for immediate sending)
const sendEmail = async (to, subject, html) => {
    try {
        const transporter = createTransporter();
        await transporter.sendMail({
            from: `"PASC CCA" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        return true;
    }
    catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
// Process email queue (should be run by a cron job or worker)
const processEmailQueue = async (batchSize = 10) => {
    const pendingEmails = await prisma_1.prisma.emailQueue.findMany({
        where: {
            status: client_1.EmailStatus.PENDING,
            attempts: { lt: 3 }, // Max 3 attempts
        },
        take: batchSize,
        orderBy: { createdAt: 'asc' },
    });
    for (const email of pendingEmails) {
        try {
            const success = await (0, exports.sendEmail)(email.to, email.subject, email.body);
            if (success) {
                await prisma_1.prisma.emailQueue.update({
                    where: { id: email.id },
                    data: {
                        status: client_1.EmailStatus.SENT,
                        sentAt: new Date(),
                    },
                });
            }
            else {
                throw new Error('Failed to send email');
            }
        }
        catch (error) {
            await prisma_1.prisma.emailQueue.update({
                where: { id: email.id },
                data: {
                    status: email.attempts >= 2 ? client_1.EmailStatus.FAILED : client_1.EmailStatus.PENDING,
                    attempts: { increment: 1 },
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                },
            });
        }
    }
};
exports.processEmailQueue = processEmailQueue;
// Helper functions for specific email types
const sendEventReminderEmail = async (userEmail, userName, eventTitle, eventDate, location) => {
    await (0, exports.queueEmail)(userEmail, 'eventReminder', {
        userName,
        eventTitle,
        eventDate,
        location,
    });
};
exports.sendEventReminderEmail = sendEventReminderEmail;
const sendRsvpConfirmationEmail = async (userEmail, userName, eventTitle, eventDate, location) => {
    await (0, exports.queueEmail)(userEmail, 'rsvpConfirmation', {
        userName,
        eventTitle,
        eventDate,
        location,
    });
};
exports.sendRsvpConfirmationEmail = sendRsvpConfirmationEmail;
const sendWaitlistPromotedEmail = async (userEmail, userName, eventTitle, eventDate, location) => {
    await (0, exports.queueEmail)(userEmail, 'waitlistPromoted', {
        userName,
        eventTitle,
        eventDate,
        location,
    });
};
exports.sendWaitlistPromotedEmail = sendWaitlistPromotedEmail;
const sendAttendanceMarkedEmail = async (userEmail, userName, eventTitle, sessionName, credits) => {
    await (0, exports.queueEmail)(userEmail, 'attendanceMarked', {
        userName,
        eventTitle,
        sessionName,
        credits,
    });
};
exports.sendAttendanceMarkedEmail = sendAttendanceMarkedEmail;
const sendAnnouncementEmail = async (userEmail, title, message, priority) => {
    await (0, exports.queueEmail)(userEmail, 'announcement', {
        title,
        message,
        priority,
    });
};
exports.sendAnnouncementEmail = sendAnnouncementEmail;
