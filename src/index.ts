import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import dotenv from 'dotenv';
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
}); 