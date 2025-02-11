import { prisma } from "../prisma/client.js";
import { validate as isUUID } from "uuid";  // Import the UUID validation function

// Create a new delivery
export const createDelivery = async (req, reply) => {
  const { address, city, deliveryStatus, deliveryMethod, orderId } = req.body;
  
  try {
    const delivery = await prisma.delivery.create({
      data: {
        address,
        city,
        deliveryStatus,
        deliveryMethod,
        orderId
      }
    });
    reply.status(201).send(delivery);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    reply.status(500).send({ message: "Failed to create delivery", error: error.message });
  }
};

// Get all deliveries
export const getDeliveries = async (req, reply) => {
  try {
    const deliveries = await prisma.delivery.findMany();
    reply.status(200).send(deliveries);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    reply.status(500).send({ message: "Failed to retrieve deliveries", error: error.message });
  }
};

// Get a delivery by ID
export const getDeliveryById = async (req, reply) => {
  const { id } = req.params;

  // Check if ID is a valid UUID
  if (!isUUID(id)) {
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    const delivery = await prisma.delivery.findUnique({
      where: { id }
    });
    
    if (!delivery) {
      return reply.status(404).send({ message: "Delivery not found" });
    }

    reply.status(200).send(delivery);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    reply.status(500).send({ message: "Failed to retrieve delivery", error: error.message });
  }
};

// Update delivery by ID
export const updateDelivery = async (req, reply) => {
  const { id } = req.params;
  const { address, city, deliveryStatus, deliveryMethod } = req.body;

  // Check if ID is a valid UUID
  if (!isUUID(id)) {
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: {
        address,
        city,
        deliveryStatus,
        deliveryMethod
      }
    });

    reply.status(200).send(updatedDelivery);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    reply.status(500).send({ message: "Failed to update delivery", error: error.message });
  }
};

// Delete delivery by ID
export const deleteDelivery = async (req, reply) => {
  const { id } = req.params;

  // Check if ID is a valid UUID
  if (!isUUID(id)) {
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    const deletedDelivery = await prisma.delivery.delete({
      where: { id }
    });
    
    reply.status(200).send(deletedDelivery);
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    reply.status(500).send({ message: "Failed to delete delivery", error: error.message });
  }
};
