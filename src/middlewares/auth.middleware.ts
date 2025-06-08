import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend Express Request type to include user/admin
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        type: 'user';
      };
      admin?: {
        id: number;
        email: string;
        type: 'admin';
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token is required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ITokenPayload;
    
    if (decoded.type === 'user') {
      const userPayload = { ...decoded, type: 'user' as const };
      req.user = userPayload;
    } else if (decoded.type === 'admin') {
      const adminPayload = { ...decoded, type: 'admin' as const };
      req.admin = adminPayload;
    }
    
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Invalid token',
    });
  }
};

// Middleware to ensure user authentication
export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(403).json({
      success: false,
      error: 'User authentication required',
    });
    return;
  }
  next();
};

// Middleware to ensure admin authentication
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.admin) {
    res.status(403).json({
      success: false,
      error: 'Admin authentication required',
    });
    return;
  }
  next();
}; 