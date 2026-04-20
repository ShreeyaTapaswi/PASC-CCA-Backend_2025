import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Password validation schema
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// User registration schema
export const userRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  department: z.enum(['CE', 'IT', 'ENTC', 'ECE', 'AIDS']),
  year: z.number().int().min(1).max(4),
  passoutYear: z.number().int().min(2020).max(2030),
  roll: z.number().int().positive()
});

// Admin registration schema
export const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  password: passwordSchema
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Event creation schema
export const eventCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(2, 'Location is required'),
  credits: z.number().positive('Credits must be positive'),
  numDays: z.number().int().positive('Number of days must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  prerequisite: z.string().optional()
});

// RSVP schema
export const rsvpCreateSchema = z.object({
  eventId: z.number().int().positive()
});

// Review schema
export const reviewCreateSchema = z.object({
  eventId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  review: z.string().min(10, 'Review must be at least 10 characters').max(1000)
});

// Announcement schema
export const announcementCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  targetDepartment: z.array(z.enum(['CE', 'IT', 'ENTC', 'ECE', 'AIDS'])).optional(),
  targetYear: z.array(z.number().int().min(1).max(2)).optional(),
  expiresAt: z.string().or(z.date()).optional()
});

// Middleware factory for validation
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        console.log('❌ Validation failed for request body:', req.body);
        console.log('❌ Validation errors:', result.error.issues);
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: result.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

