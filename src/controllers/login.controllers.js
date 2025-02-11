import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
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
    const data = await loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.info(`Invalid login attempt for email: ${data.email}`);
      return reply.status(400).send({ data: { message: "Invalid email address" } });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      logger.info(`Invalid password attempt for email: ${data.email}`);
      return reply.status(400).send({ data: { message: "Invalid password" } });
    }

    // ✅ Generate Access & Refresh Tokens
    const accessToken = req.server.jwt.sign(
      { id: user.userId, role: user.role },
      { expiresIn: "15m" }
    );
    const refreshToken = req.server.jwt.sign(
      { id: user.userId },
      { expiresIn: "7d" }
    );

    // ✅ Store Tokens in HTTP-only Cookies
    reply
      .setCookie("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      .setCookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      })
      .status(200)
      .send({
        user: {
          id: user.userId,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNo: user.phoneNo,
          role: user.role,
          avatar: user.avatar,
        },
      });
  } catch (error) {
    logger.error("Error:", error);
    console.error("Error:", error);

    if (error instanceof z.ZodError) {
      return reply.status(400).send({ data: { message: "Invalid input", errors: error.errors } });
    }

    reply.status(500).send({ data: { message: "An error occurred. Kindly refresh.", error: error.message } });
  }
};
