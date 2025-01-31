import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

//Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error " }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
//Validation Schema
const loginSchema = z.object({
  email: z.string().email({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  }),
  password: z.string(),
});

//Login operation
const prisma = new PrismaClient();

export const loginController = async (req, reply) => {
  try {
    const data = await loginSchema.parse(req.body);

    const login = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!login) {
      logger.info(`Invalid login attempt for email: ${data.email}`);
      reply.status(400).send({ message: "Invalid email address" });
    }
    const isPasswordValid = await bcrypt.compare(data.password, login.password);

    if (!isPasswordValid) {
      logger.info(`Invalid password attempt for email: ${data.email}`);
      reply.status(400).send({ Error: "Invalid email" });
    }
    const token = req.server.jwt.sign({
      id: login.userId,
      firstname: login.firstname,
      lastname: login.lastname,
      email: login.email,
      phoneNo: login.phoneNo,
      role: login.role,
      avatar: login.avatar,
    });

    reply.status(200).send({
      token: token,
      user: {
        id: login.userId,
        firstname: login.firstname,
        lastname: login.lastname,
        email: login.email,
      },
    });
  } catch (error) {
    logger.error("Error:", error);
    console.error("Error:", error);
    if (error instanceof z.ZodError) {
      reply.status(400).send({ error: error.errors });
    }
    reply.status(500).send({ message: "An error occured. Kindly refresh." });
  }
};
