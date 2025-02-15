import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const checkCategoryExists = async (req, reply) => {
  const categoryId = req.params.id;

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return reply.status(404).send({ message: "Category not found" });
    }

    req.category = category;
  } catch (error) {
    return reply
      .status(500)
      .send({ message: "Error checking category", error });
  }
};

export const validateCategoryInput = async (req, reply) => {
  const { name, description, thumbnail } = req.body;
  console.log(req.body)

  if (!name || !description || !thumbnail) {
    console.log(name)
    return reply
      .status(400)
      .send({ message: "Name and description are required" });
  }
};

