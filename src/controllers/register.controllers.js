import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
export const registerUser = async (req, reply) => {
  try {
    const registerData = req.body;

    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    const register = await prisma.user.create({
      data: {
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        email: registerData.email,
        password: hashedPassword,
        role: registerData.role,
      },
    });

    reply.status(201).send({
      message: "Account created successfully.",
      user: {
        id: register.userId,
        firstname: register.firstname,
        lastname: register.lastname,
        email: register.email,
      },
    });
  } catch (error) {
    console.error(`Register error: ${error}`);
    reply.status(500).send({ message: "Something went wrong" });
  }
};
