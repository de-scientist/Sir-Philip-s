import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt, { compareSync } from "bcrypt";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }),
  password: z.string(),
});

// Initialize Prisma
const prisma = new PrismaClient();

export const loginController = async (req, reply) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        userId: true,
        email: true,
        password: true,
        firstname: true,
        lastname: true,
        role: true
      }
    });

    if (!user || !compareSync(password, user.password)) {
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Generate tokens
    const accessToken = await reply.jwtSign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      { expiresIn: '60m' }
    );

    const refreshToken = await reply.jwtSign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role
      },
      { expiresIn: '28d' }
    );

    // Set cookies
    reply.setCookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    reply.setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 28 * 24 * 60 * 60 * 1000 // 28 days
    });

    // Return user data without sensitive information
    return reply.send({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error"
    });
  }
};
