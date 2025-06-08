import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();
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
  userId?: string,
  adminId?: string,
  payload?: ITokenPayload
): Promise<void> => {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    if (userId) {
      await prisma.userToken.create({
        data: { token, userId, expiresAt },
      });
    } else if (adminId) {
      await prisma.adminToken.create({
        data: { token, adminId, expiresAt },
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
export const createUser = async (userData: IUserCreate): Promise<IAuthResponse> => {
  const hashedPassword = await hashPassword(userData.password);
  
  const user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      hours: 0, // Initialize hours to 0
    },
  });

  const payload: ITokenPayload = { id: user.id, email: user.email, type: 'user' };
  const token = generateToken(payload);
  
  await createTokenWithRetry(token, user.id, undefined, payload);

  return {
    user,
    token,
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
    user,
    token,
  };
};

// Admin Authentication Functions
export const createAdmin = async (adminData: IAdminCreate): Promise<IAuthResponse> => {
  const hashedPassword = await hashPassword(adminData.password);
  
  const admin = await prisma.admin.create({
    data: {
      ...adminData,
      password: hashedPassword,
    },
  });

  const payload: ITokenPayload = { id: admin.id, email: admin.email, type: 'admin' };
  const token = generateToken(payload);

  await createTokenWithRetry(token, undefined, admin.id, payload);

  return {
    admin,
    token,
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
    admin,
    token,
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
  return prisma.user.findUnique({
    where: { id },
  });
};

export const getAdminById = async (id: number): Promise<IAdmin | null> => {
  return prisma.admin.findUnique({
    where: { id },
  });
}; 