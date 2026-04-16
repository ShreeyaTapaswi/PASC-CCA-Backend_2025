import { Prisma } from '@prisma/client';

export const handleError = (error: unknown, defaultMessage: string = 'Server error'): string => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = error.meta?.target;
        
        if (Array.isArray(target)) {
          if (target.includes('email')) return 'An account with this email already exists.';
          if (target.includes('roll')) return 'An account with this roll number already exists.';
          return `A record with this ${target.join(', ')} already exists.`;
        } 
        
        if (typeof target === 'string') {
          if (target.toLowerCase().includes('email')) return 'An account with this email already exists.';
          if (target.toLowerCase().includes('roll')) return 'An account with this roll number already exists.';
          return `A record with this ${target} already exists.`;
        }

        return 'A record with this information already exists.';
      }
      case 'P2025':
        return 'Record not found or already deleted.';
      case 'P2003':
        return 'Database constraint failed. Related record does not exist or cannot be deleted.';
      case 'P2014':
        return 'The change would violate the required relation between records.';
      default:
        return 'A database error occurred.';
    }
  }

  // Handle standard errors explicitly thrown by our services (e.g. "Invalid password", "User not found")
  if (error instanceof Error) {
    if (error.message.includes('Invalid argument')) {
      return 'Invalid or incomplete input provided.';
    }
    // Return the safe error messages we manually throw
    return error.message;
  }

  return defaultMessage;
};
