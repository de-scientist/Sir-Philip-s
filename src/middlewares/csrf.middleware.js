import { logger } from "../utils/logger.js";
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Validates CSRF token for non-GET, non-HEAD, non-OPTIONS requests
 */
export const csrfProtection = async (request, reply) => {
  // Skip for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(request.method)) {
    return;
  }
  
  const csrfToken = request.headers['x-csrf-token'];
  const storedToken = request.cookies.csrfToken;
  
  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    logger.warn('CSRF token validation failed');
    return reply.code(403).send({ 
      error: "Forbidden",
      message: "Invalid token" 
    });
  }
};

/**
 * Set CSRF token if not present
 */
export const setCsrfToken = async (request, reply) => {
  if (!request.cookies.csrfToken) {
    const token = crypto.randomUUID();
    reply.setCookie('csrfToken', token, {
      httpOnly: false, // Must be accessible via JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    reply.header('X-CSRF-Token', token);
  }
};
