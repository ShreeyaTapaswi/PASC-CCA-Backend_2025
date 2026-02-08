import { Request, Response } from 'express';
import {
  generateEventICS,
  generateUserCalendarICS,
  generatePublicCalendarICS,
  getEventCalendarLinks
} from '../services/calendar.service';
import { prisma } from '../lib/prisma';

export const downloadEventCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    const ics = generateEventICS(event);
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}.ics"`);
    res.send(ics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate calendar'
    });
  }
};

export const downloadUserCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const ics = await generateUserCalendarICS(userId);
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="my-events.ics"');
    res.send(ics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate calendar'
    });
  }
};

export const downloadPublicCalendar = async (req: Request, res: Response): Promise<void> => {
  try {
    const ics = await generatePublicCalendarICS();
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="pasc-events.ics"');
    res.send(ics);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to generate calendar'
    });
  }
};

export const getCalendarLinks = async (req: Request, res: Response): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      res.status(400).json({ success: false, message: 'Invalid event ID' });
      return;
    }

    const result = await getEventCalendarLinks(eventId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get calendar links'
    });
  }
};


