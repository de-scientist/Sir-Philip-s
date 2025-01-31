import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Middleware to validate registration input
export const validateRegistrationInput = async (req, reply) => {
  const registerSchema = z.object({
    firstname: z.string().min(3, "Please enter a valid name."),
    lastname: z.string().min(3, "Please enter a valid name."),
    email: z.string().email("Please enter a valid Email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
  });

  try {
    // Validate request body against the schema
    registerSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors });
    }
    return reply.status(500).send({ message: "Internal server error during validation." });
  }
};

// Middleware to check if the email is already in use
export const checkIfEmailExists = async (req, reply) => {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(400).send({ message: "Email address is already in use." });
    }
  } catch (error) {
    return reply.status(500).send({ message: "Error checking for existing user." });
  }
};
