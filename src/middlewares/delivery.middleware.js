import { z } from "zod";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// Zod schema for validating delivery input
const deliverySchema = z.object({
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  orderId: z.string().min(1, { message: "Order ID is required" }),
});

// Middleware to validate delivery input using Zod
export const validateDeliveryInput = async (req, reply) => {
  try {
    // Validate the request body against the schema
    deliverySchema.parse(req.body); // If validation fails, Zod will throw an error
  } catch (error) {
    reply.status(400).send({ message: error.errors[0].message }); // Send error message from Zod
  }
};

// Middleware to check if a delivery exists
export const checkDeliveryExists = async (req, reply) => {
  const { id } = req.params;

  try {
    // Check if the delivery exists in the database using Prisma
    const delivery = await prisma.delivery.findUnique({
      where: { id },
    });

    if (!delivery) {
      // Return a 404 if the delivery doesn't exist
      return reply.status(404).send({ message: "Delivery not found" });
    }
  } catch (error) {
    // Return an error response if there's a problem with the database query
    reply.status(500).send({ message: "Failed to check delivery", error });
  }
};
