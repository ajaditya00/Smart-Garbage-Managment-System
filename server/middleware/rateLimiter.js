import rateLimit from 'express-rate-limit';

// Rate limiter for authentication login: 5 failed attempts per 15 minutes per IP
// Successful logins (HTTP 2xx) do not decrement the remaining quota (skipSuccessfulRequests: true)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 failed attempts per windowMs
  skipSuccessfulRequests: true, // Only count failed attempts towards the limit
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Too many failed login attempts. Please try again after 15 minutes.'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message.message || 'Too many requests, please try again later.'
    });
  }
});

// Rate limiter for public user registration: 10 registrations per hour per IP
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 registration attempts per hour
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    message: 'Too many accounts created from this IP. Please try again after an hour.'
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      message: options.message.message || 'Too many requests, please try again later.'
    });
  }
});
