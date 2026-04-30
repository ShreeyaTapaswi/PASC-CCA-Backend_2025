import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  IUser,
  IAdmin,
  IUserCreate,
  IAdminCreate,
  IUserLogin,
  IAdminLogin,
  IAuthResponse,
  ITokenPayload
} from '../types/auth.types';
import  prisma  from '../lib/prisma';
import { sendPasswordResetEmail } from './email.service';
import crypto from 'crypto';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Pure function to hash password
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Pure function to compare passwords
const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Pure function to generate JWT token
const generateToken = (payload: ITokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Helper function to create token with retry
const createTokenWithRetry = async (
  token: string,
  userId?: number,
  adminId?: number,
  payload?: ITokenPayload
): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    if (userId) {
      await prisma.userToken.create({
        data: { token, expiresAt, user: { connect: { id: userId } } },
      });
    } else if (adminId) {
      await prisma.adminToken.create({
        data: { token, expiresAt, admin: { connect: { id: adminId } } },
      });
    }
  } catch (error) {
    // If token already exists, generate a new one and retry
    if (error instanceof Error && error.message.includes('Unique constraint') && payload) {
      const newToken = generateToken(payload);
      await createTokenWithRetry(newToken, userId, adminId, payload);
    } else {
      throw error;
    }
  }
};

// User Authentication Functions
// Registration: create user, but do NOT issue a login token
export const createUser = async (userData: IUserCreate): Promise<IUser> => {
  const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
  const existingAdmin = await prisma.admin.findUnique({ where: { email: userData.email } });
  if (existingUser || existingAdmin) {
    throw new Error('An account with this email already exists.');
  }

  const existingRollUser = await prisma.user.findFirst({ where: { roll: userData.roll } });
  if (existingRollUser) {
    throw new Error('An account with this roll number already exists.');
  }

  const hashedPassword = await hashPassword(userData.password);
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      hours: 0, // Initialize hours to 0
    },
  });

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    department: user.department, // ✅ now typed as prisma.Department
    year: user.year,
    passoutYear: user.passoutYear,
    roll: user.roll,
    hours: user.hours,
  };
};

export const loginUser = async (credentials: IUserLogin): Promise<IAuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await comparePasswords(credentials.password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const payload: ITokenPayload = { id: user.id, email: user.email, type: 'user' };
  const token = generateToken(payload);

  await createTokenWithRetry(token, user.id, undefined, payload);

  return {
    user: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      department: user.department, // ✅ now typed as prisma.Department
      year: user.year,
      passoutYear: user.passoutYear,
      roll: user.roll,
      hours: user.hours,
    },
    token,
  };
};

// Admin Authentication Functions
// Registration: create admin, but do NOT issue a login token
export const createAdmin = async (adminData: IAdminCreate): Promise<IAdmin> => {
  const existingUser = await prisma.user.findUnique({ where: { email: adminData.email } });
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminData.email } });
  if (existingUser || existingAdmin) {
    throw new Error('An account with this email already exists.');
  }

  const hashedPassword = await hashPassword(adminData.password);

  const admin = await prisma.admin.create({
    data: {
      ...adminData,
      password: hashedPassword,
    },
  });

  return {
    id: admin.id,
    name: admin.name !== null ? admin.name : "",
    email: admin.email
  };
};

export const loginAdmin = async (credentials: IAdminLogin): Promise<IAuthResponse> => {
  const admin = await prisma.admin.findUnique({
    where: { email: credentials.email },
  });

  if (!admin) {
    throw new Error('Admin not found');
  }

  const isPasswordValid = await comparePasswords(credentials.password, admin.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const payload: ITokenPayload = { id: admin.id, email: admin.email, type: 'admin' };
  const token = generateToken(payload);

  await createTokenWithRetry(token, undefined, admin.id, payload);

 return {
    admin: {
      id: admin.id,
      name: admin.name !== null ? admin.name : "",
      email: admin.email
    },
    token
  };
};

// Logout Functions
export const logoutUser = async (token: string): Promise<void> => {
  try {
    await prisma.userToken.delete({
      where: { token },
    });
  } catch (error) {
    throw new Error('Failed to logout user');
  }
};

export const logoutAdmin = async (token: string): Promise<void> => {
  try {
    await prisma.adminToken.delete({
      where: { token },
    });
  } catch (error) {
    throw new Error('Failed to logout admin');
  }
};

// Get User/Admin by ID
export const getUserById = async (id: number): Promise<IUser | null> => {
  const user = await  prisma.user.findUnique({
    where: { id },
  });
  if(!user)
  {
    return null;
  }
  return  {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      department: user.department, // ✅ now typed as prisma.Department
      year: user.year,
      passoutYear: user.passoutYear,
      roll: user.roll,
      hours: user.hours,
  }
};

export const getAdminById = async (id: number): Promise<IAdmin | null> => {
  const admin = await prisma.admin.findUnique({
    where: { id },
  });
  if(!admin){
    return null;
  }
  return {
      id: admin.id,
      name: admin.name !== null ? admin.name : "",
      email: admin.email
    }
};

// Add this function to count users
export const getUserCount = async (): Promise<number> => {
  const count = await prisma.user.count();
  return count;
};

// Forgot Password - Generate and send token
export const forgotPassword = async (email: string): Promise<void> => {
  // Check if user or admin exists
  const user = await prisma.user.findUnique({ where: { email } });
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!user && !admin) {
    throw new Error('No account found with this email address.');
  }

  const name = user ? user.name || 'Student' : admin?.name || 'Admin';

  // Generate 6-digit code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token (upsert to handle multiple requests)
  await prisma.passwordResetToken.upsert({
    where: { token },
    update: { email, expiresAt },
    create: { token, email, expiresAt },
  });

  // Send email
  await sendPasswordResetEmail(email, name, token, expiresAt.toLocaleString());
};

// Reset Password - Verify token and update password
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new Error('Invalid or expired reset code.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update User or Admin
  const user = await prisma.user.findUnique({ where: { email: resetRecord.email } });
  const admin = await prisma.admin.findUnique({ where: { email: resetRecord.email } });

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  } else if (admin) {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { password: hashedPassword },
    });
  }

  // Cleanup tokens for this email
  await prisma.passwordResetToken.deleteMany({
    where: { email: resetRecord.email },
  });
};
 