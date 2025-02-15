import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const validateRegistrationInput = async (req, reply) => {
  console.log("first")
  const registerSchema = z.object({
    firstname: z.string().min(3, "Please enter a valid name."),
    lastname: z.string().min(3, "Please enter a valid name."),
    email: z.string().email("Please enter a valid Email address."),
    password: z.string().min(6, "Password must be at least 6 characters long."),
  });

  try {
    registerSchema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ message:"Invalid details"});
    }
    return reply
      .status(500)
      .send({ message: "Something went wrong" });
  }
};

export const checkIfEmailExists = async (req, reply) => {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply
        .status(400)
        .send({ message: "Email already exists" });
    }
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Something went wrong" });
  }
};
