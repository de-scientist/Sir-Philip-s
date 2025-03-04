import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { compareSync } from "bcrypt";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

dotenv.config();

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

    logger.info("Login attempt", { email });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        userId: true,
        email: true,
        password: true,
        firstname: true,
        lastname: true,
        avatar: true,
        role: true,
      },
    });

    if (!user || !compareSync(password, user.password)) {
      logger.warn("Failed login attempt", { email });
      return reply.status(401).send({
        success: false,
        error: "Invalid credentials",
      });
    }

    logger.info("User logged in successfully", {
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    // Generate tokens
    const accessToken = await reply.jwtSign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      { expiresIn: "60m" },
    );

    const refreshToken = await reply.jwtSign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
      },
      { expiresIn: "28d" },
    );

    // Set cookies
    reply.setCookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    reply.setCookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28 * 24 * 60 * 60 * 1000, // 28 days
    });

    logger.debug("Tokens generated and cookies set", { userId: user.userId });

    return reply.status(200).send({
      success: true,
      message: "Login successful",
      user: {
        userId: user.userId,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        avatar: user.avatar
      },
    });
  } catch (error) {
    console.error(error);
    logger.error("Login error occurred", {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
    });
    console.error("Login error:", error);
    return reply.status(500).send({
      success: false,
      error: "Internal server error",
    });
  }
};
