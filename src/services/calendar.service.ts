import { prisma } from '../lib/prisma';
import { Event } from '@prisma/client';

// Generate iCal format for a single event
export const generateEventICS = (event: Event): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PASC CCA//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:event-${event.id}@pasc-cca.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return ics;
};

// Generate iCal for multiple events (user's calendar)
export const generateUserCalendarICS = async (userId: number): Promise<string> => {
  const rsvps = await prisma.rsvp.findMany({
    where: {
      userId,
      status: 'ATTENDING',
      waitlisted: false
    },
    include: {
      event: true
    }
  });

  const events = rsvps.map(r => r.event);

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const icsEvents = events.map(event => [
    'BEGIN:VEVENT',
    `UID:event-${event.id}@pasc-cca.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT'
  ].join('\r\n')).join('\r\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PASC CCA//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PASC CCA Events',
    'X-WR-TIMEZONE:Asia/Kolkata',
    icsEvents,
    'END:VCALENDAR'
  ].join('\r\n');

  return ics;
};

// Generate iCal for all upcoming events (public calendar)
export const generatePublicCalendarICS = async (): Promise<string> => {
  const events = await prisma.event.findMany({
    where: {
      status: {
        in: ['UPCOMING', 'ONGOING']
      }
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const escapeText = (text: string): string => {
    return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
  };

  const icsEvents = events.map(event => [
    'BEGIN:VEVENT',
    `UID:event-${event.id}@pasc-cca.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    `DTEND:${formatDate(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    `URL:${process.env.FRONTEND_URL || 'http://localhost:3000'}/events/${event.id}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT'
  ].join('\r\n')).join('\r\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PASC CCA//Public Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:PASC CCA Public Events',
    'X-WR-TIMEZONE:Asia/Kolkata',
    'X-WR-CALDESC:All upcoming PASC CCA events',
    icsEvents,
    'END:VCALENDAR'
  ].join('\r\n');

  return ics;
};

// Generate Google Calendar URL for an event
export const generateGoogleCalendarURL = (event: Event): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startDate)}/${formatDate(event.endDate)}`,
    details: event.description,
    location: event.location,
    trp: 'false'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Generate Outlook Calendar URL for an event
export const generateOutlookCalendarURL = (event: Event): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString();
  };

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: formatDate(event.startDate),
    enddt: formatDate(event.endDate),
    body: event.description,
    location: event.location
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

// Get calendar links for an event
export const getEventCalendarLinks = async (eventId: number) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    return {
      success: false,
      message: 'Event not found'
    };
  }

  return {
    success: true,
    data: {
      googleCalendar: generateGoogleCalendarURL(event),
      outlookCalendar: generateOutlookCalendarURL(event),
      icsDownload: `/api/calendar/event/${eventId}/download`
    }
  };
};


