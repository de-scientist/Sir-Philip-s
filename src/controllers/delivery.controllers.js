import { PrismaClient } from "@prisma/client";
import { logger } from '../utils/logger.js'
import { z } from "zod";

const prisma = new PrismaClient();

const deliverySchema = z.object({
  address: z.string(),
  city: z.string(),
  orderId: z.string()
})

// Create a new delivery
export const createDelivery = async (req, reply) => {
  try {
    const data = deliverySchema.parse(req.body)
    logger.info('Creating new delivery', { address: data.address, city: data.city });

    const delivery = await prisma.delivery.create({
      data: {
        address: data.address,
        city: data.city,
        orderId: data.orderId,
        deliveryStatus: 'pending',
        deliveryMethod: 'standard',
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    logger.info('Delivery created successfully', { deliveryId: delivery.id });
    reply.status(201).send(delivery);
  } catch (error) {
    console.error(error);
    logger.error('Failed to create delivery', { error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to create delivery", error: error.message });
  }
};

// Get all deliveries
export const getDeliveries = async (req, reply) => {
  try {
    logger.info('Fetching all deliveries');
    const deliveries = await prisma.delivery.findMany();
    logger.info('Deliveries retrieved successfully', { count: deliveries.length });
    reply.status(200).send(deliveries);
  } catch (error) {
    logger.error('Failed to retrieve deliveries', { error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to retrieve deliveries", error: error.message });
  }
};

// Get a delivery by ID
export const getDeliveryById = async (req, reply) => {
  const { id } = req.params;

  if (!id) {
    logger.warn('Invalid Id', { id });
    return reply.status(400).send({ message: "Invalid ID" });
  }

  try {
    logger.info('Fetching delivery by ID', { id });
    const delivery = await prisma.delivery.findUnique({ where: { id } });

    if (!delivery) {
      logger.info('Delivery not found', { id });
      return reply.status(404).send({ message: "Delivery not found" });
    }

    logger.info('Delivery retrieved successfully', { id });
    reply.status(200).send(delivery);
  } catch (error) {
    logger.error('Failed to retrieve delivery', { id, error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to retrieve delivery", error: error.message });
  }
};

// Update delivery by ID
export const updateDelivery = async (req, reply) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!isUUID(id)) {
    logger.warn('Invalid delivery ID format', { id });
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    logger.info('Updating delivery', { id, updateData });
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
    });

    logger.info('Delivery updated successfully', { id });
    reply.status(200).send(updatedDelivery);
  } catch (error) {
    logger.error('Failed to update delivery', { id, error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to update delivery", error: error.message });
  }
};

// Delete delivery by ID
export const deleteDelivery = async (req, reply) => {
  const { id } = req.params;

  if (!isUUID(id)) {
    logger.warn('Invalid delivery ID format', { id });
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    logger.info('Deleting delivery', { id });
    const deletedDelivery = await prisma.delivery.delete({ where: { id } });
    logger.info('Delivery deleted successfully', { id });
    reply.status(200).send(deletedDelivery);
  } catch (error) {
    logger.error('Failed to delete delivery', { id, error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to delete delivery", error: error.message });
  }
};
