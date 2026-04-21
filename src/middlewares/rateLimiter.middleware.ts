import rateLimit from 'express-rate-limit';

// General API rate limiter - 2000 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth rate limiter - 200 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 login/register requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed authentication attempts
});

// Moderate rate limiter for creation endpoints - 200 requests per 15 minutes
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    error: 'Too many creation requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
//testing in progress
