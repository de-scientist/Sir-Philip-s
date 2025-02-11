import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import winston from "winston";

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

const loginSchema = z.object({
  email: z.string().email({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }),
  password: z.string(),
});

const prisma = new PrismaClient();

export const loginController = async (req, reply) => {
  try {
    const data = await loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      logger.info(`Invalid login attempt for email: ${data.email}`);
      return reply.status(400).send({ message: "Invalid email address" });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      logger.info(`Invalid password attempt for email: ${data.email}`);
      return reply.status(400).send({ message: "Incorrect login details" });
    }

    const accessToken = req.server.jwt.sign(
      { id: user.userId, role: user.role },
      { expiresIn: "15m" }
    );
    const refreshToken = req.server.jwt.sign(
      { id: user.userId },
      { expiresIn: "7d" }
    );

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
          avatar: user?.avatar,
        },
      });

    logger.info(`User logged in: ${email}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply
        .status(400)
        .send({ message: "Invalid input", errors: error.errors });
    }

    logger.error(`Login error: ${error.message}`);
    reply.status(500).send({ message: "Something went wrong" });
  }
};
