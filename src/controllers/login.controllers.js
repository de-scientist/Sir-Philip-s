import { logger } from "../utils/logger.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginController = async (request, reply) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(request.body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist or password is incorrect
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Failed login attempt for ${email}`);
      return reply.code(401).send({ message: 'Invalid email or password' });
    }

    // Generate a CSRF token
    const csrfToken = crypto.randomUUID();
    
    // Create JWT payload (exclude sensitive info)
    const tokenPayload = {
      userId: user.userId,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role
    };

    // Sign token with 24-hour expiration
    const token = await reply.jwtSign(tokenPayload, { expiresIn: '24h' });
    
    // Set HTTP-only cookie with the token
    reply.setCookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Set CSRF token cookie (accessible to JavaScript)
    reply.setCookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return user data and CSRF token (but not the JWT)
    logger.info(`User ${user.email} logged in successfully`);
    reply.header('X-CSRF-Token', csrfToken).send({
      user: {
        userId: user.userId,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Login validation failed', { errors: error.errors });
      return reply.code(400).send({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    
    logger.error('Login error', { error: error.message });
    reply.code(500).send({ message: 'Internal server error' });
  }
};
