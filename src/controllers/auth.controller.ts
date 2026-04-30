import { Request, Response } from 'express';
import { handleError } from '../utils/errorHandler';
import { 
  createUser, 
  loginUser, 
  createAdmin, 
  loginAdmin, 
  logoutUser, 
  logoutAdmin,
  getUserById,
  getAdminById,
  getAdminById,
  getUserCount,
  forgotPassword,
  resetPassword
} from '../services/auth.service';

/**
 * @swagger
 * /api/auth/user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - department
 *               - year
 *               - passoutYear
 *               - roll
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               department:
 *                 type: string
 *                 enum: [CE, IT, ENTC, ECE, AIDS]
 *               year:
 *                 type: integer
 *               passoutYear:
 *                 type: integer
 *               roll:
 *                 type: integer
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  res.status(403).json({
    success: false,
    error: 'Registrations are currently closed. This is an invite-only review.',
  });
};

/**
 * @swagger
 * /api/auth/user/login:
 *   post:
 *     summary: Login a user
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const loginUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = req.body;
    const result = await loginUser(credentials);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: handleError(error, 'Login failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/user/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const logoutUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }
    
    await logoutUser(token);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: handleError(error, 'Logout failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/admin/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const registerAdmin = async (req: Request, res: Response): Promise<void> => {
  res.status(403).json({
    success: false,
    error: 'Registrations are currently closed. This is an invite-only review.',
  });
};

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Login an admin
 *     tags: [Admin Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const loginAdminController = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = req.body;
    const result = await loginAdmin(credentials);
    
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: handleError(error, 'Admin login failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/admin/logout:
 *   post:
 *     summary: Logout an admin
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const logoutAdminController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('No token provided');
    }
    
    await logoutAdmin(token);
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: handleError(error, 'Logout failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    console.log("userId : " , userId);
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const user = await getUserById(userId);
    console.log("user : " ,  user);
    if (!user) {
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: handleError(error, 'Authentication failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/admin/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Admin'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getCurrentAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.admin?.id;
    
    if (!adminId) {
      throw new Error('Admin not authenticated');
    }

    const admin = await getAdminById(adminId);
    
    if (!admin) {
      throw new Error('Admin not found');
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: handleError(error, 'Authentication failed'),
    });
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent to email
 *       400:
 *         description: Account not found
 */
export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await forgotPassword(email);
    res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: handleError(error, 'Failed to process forgot password request'),
    });
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using the code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid or expired token
 */
export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res.status(200).json({
      success: true,
      message: 'Your password has been updated successfully.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: handleError(error, 'Failed to reset password'),
    });
  }
};

/**
 * @swagger
 * /api/auth/user/count:
 *   get:
 *     summary: Get the total number of users (students)
 *     tags: [User Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getUserCountController = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await getUserCount();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, error: handleError(error, 'Failed to get user count') });
  }
}; 