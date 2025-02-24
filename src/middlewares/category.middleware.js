import { PrismaClient } from "@prisma/client";

// Create a Prisma Client instance
const prisma = new PrismaClient();

// Middleware to check if a category exists
export const checkCategoryExists = async (req, reply) => {
  const categoryId = req.params.id;

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return reply.status(404).send({ message: "Category not found" });
    }

    req.category = category; // Attach category to request object
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Error checking category", error });
  }
};

// Middleware to validate category input
export const validateCategoryInput = async (req, reply) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return reply
      .status(400)
      .send({ message: "Name and description are required" });
  }
};
