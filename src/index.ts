import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';
import rsvpRoutes from './routes/rsvp.routes';
import attendanceRoutes from './routes/attendance.routes';
import reviewRoutes from './routes/review.routes';
import resourceRoutes from './routes/resource.routes';
import galleryRoutes from './routes/gallery.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import announcementRoutes from './routes/announcement.routes';
import analyticsRoutes from './routes/analytics.routes';
import calendarRoutes from './routes/calendar.routes';
import notificationRoutes from './routes/notification.routes';
import inviteRoutes from './routes/invite.routes';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { deleteOldNotifications, NOTIFICATION_EXPIRY_DAYS } from './services/notification.service';
import { refreshEventStatuses } from './services/event.service';
import {
  registerUser,
  loginUserController,
  logoutUserController,
  getCurrentUser,
  registerAdmin,
  loginAdminController,
  logoutAdminController,
  getCurrentAdmin
} from './controllers/auth.controller';
import { authenticateToken, requireUser, requireAdmin } from './middlewares/auth.middleware';


// Load environment variables
dotenv.config();

const app = express();

// Trust first proxy (required for Render deployment)
app.set('trust proxy', 1);

app.use(cors({
  origin: "*",
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// app.use((req, res, next) => {
//   res.setHeader(
//     "Content-Security-Policy",
//     "default-src 'self'; connect-src 'self' http://localhost:3000 https://pasc-cca-backend-2025.onrender.com"
//   );
//   next();
// });

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// User Routes
app.post('/api/auth/user/register', registerUser);
app.post('/api/auth/user/login', loginUserController);
app.post('/api/auth/user/logout', authenticateToken, requireUser, logoutUserController);
app.get('/api/auth/user/me', authenticateToken, requireUser, getCurrentUser);

// Admin Routes
app.post('/api/auth/admin/register', registerAdmin);
app.post('/api/auth/admin/login', loginAdminController);
app.post('/api/auth/admin/logout', authenticateToken, requireAdmin, logoutAdminController);
app.get('/api/auth/admin/me', authenticateToken, requireAdmin, getCurrentAdmin);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rsvps', rsvpRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', inviteRoutes);

const PORT = process.env.PORT || 4000; /////////////////

async function connectDB() {
  try {
    await prisma.$connect();
    console.log("🟢 Database connected successfully!");
  } catch (error) {
    console.error("🔴 Database connection failed:", error);
    process.exit(1); // Exit process if DB connection fails
  }
}
console.log(PORT);

/** Run notification cleanup: delete notifications older than NOTIFICATION_EXPIRY_DAYS. */
async function runNotificationCleanup() {
  try {
    const result = await deleteOldNotifications(NOTIFICATION_EXPIRY_DAYS);
    if (result.count > 0) {
      console.log(`[Notifications] Deleted ${result.count} expired notifications (older than ${NOTIFICATION_EXPIRY_DAYS} days).`);
    }
  } catch (err) {
    console.error('[Notifications] Cleanup failed:', err);
  }
}

/** Interval for notification cleanup (every 6 hours). */
const NOTIFICATION_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Refreshes event statuses (UPCOMING/ONGOING/COMPLETED) based on current time. */
async function runEventStatusRefresh() {
  try {
    const { updated } = await refreshEventStatuses();
    if (updated > 0) {
      console.log(`[EventStatus] Updated ${updated} event(s) to correct status.`);
    }
  } catch (err) {
    console.error('[EventStatus] Status refresh failed:', err);
  }
}

/** Interval for event status refresh (every 5 minutes). */
const EVENT_STATUS_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function startServer() {
  await connectDB();

  // Run status refresh on startup to immediately fix any stale events
  await runEventStatusRefresh();
  setInterval(runEventStatusRefresh, EVENT_STATUS_REFRESH_INTERVAL_MS);

  await runNotificationCleanup();
  setInterval(runNotificationCleanup, NOTIFICATION_CLEANUP_INTERVAL_MS);

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
  });
}
//testing in progress
startServer();