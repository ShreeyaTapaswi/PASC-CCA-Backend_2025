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
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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

app.use(cors({
  origin: 'http://localhost:3000', 
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

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    console.log("Database_url :", process.env.DATABASE_URL);
  });
}

startServer();