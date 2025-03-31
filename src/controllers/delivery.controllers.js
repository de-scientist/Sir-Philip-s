import { PrismaClient } from "@prisma/client";
import { validate as isUUID } from "uuid";
import { logger } from '../utils/logger.js';
import { z } from "zod";

const prisma = new PrismaClient();

const deliverySchema = z.object({
  address: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  orderId: z.string().uuid("Order ID must be a valid UUID")
});

// Create a new delivery
export const createDelivery = async (req, reply) => {
  try {
    const data = deliverySchema.parse(req.body);
    logger.info('Creating new delivery', { address: data.address, city: data.city });

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: data.orderId }
    });

    if (!order) {
      logger.warn('Attempted to create delivery for non-existent order', { orderId: data.orderId });
      return reply.status(404).send({ message: "Order not found" });
    }

    const trackingNumber = generateTrackingNumber();
    
    const delivery = await prisma.delivery.create({
      data: {
        address: data.address,
        city: data.city,
        orderId: data.orderId,
        deliveryStatus: 'pending',
        deliveryMethod: 'standard',
        trackingNumber: trackingNumber,
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
    
    logger.info('Delivery created successfully', { 
      deliveryId: delivery.id,
      trackingNumber: delivery.trackingNumber
    });
    
    reply.status(201).send(delivery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid delivery data', { errors: error.issues });
      return reply.status(400).send({ message: "Validation error", issues: error.issues });
    }
    
    logger.error('Failed to create delivery', { error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to create delivery" });
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
  
  if (!isUUID(id)) {
    logger.warn('Invalid delivery ID format', { id });
    return reply.status(400).send({ message: "Invalid ID format, must be a UUID" });
  }

  try {
    const updateData = await deliverySchema.partial().parseAsync(req.body);

    logger.info('Updating delivery', { id, data: updateData });
    
    // Check if delivery exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id }
    });
    
    if (!existingDelivery) {
      logger.warn('Delivery not found for update', { id });
      return reply.status(404).send({ message: "Delivery not found" });
    }
    
    const updatedDelivery = await prisma.delivery.update({
      where: { id },
      data: updateData,
    });

    logger.info('Delivery updated successfully', { id });
    reply.status(200).send(updatedDelivery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid delivery update data', { id, errors: error.issues });
      return reply.status(400).send({ message: "Validation error", issues: error.issues });
    }
    
    logger.error('Failed to update delivery', { id, error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to update delivery" });
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
    // Check if delivery exists
    const existingDelivery = await prisma.delivery.findUnique({
      where: { id }
    });
    
    if (!existingDelivery) {
      logger.warn('Delivery not found for deletion', { id });
      return reply.status(404).send({ message: "Delivery not found" });
    }
    
    const deletedDelivery = await prisma.delivery.delete({ where: { id } });
    logger.info('Delivery deleted successfully', { id });
    reply.status(200).send({ message: "Delivery deleted successfully", id });
  } catch (error) {
    logger.error('Failed to delete delivery', { id, error: error.message, stack: error.stack });
    reply.status(500).send({ message: "Failed to delete delivery" });
  }
};

// Helper function to generate tracking number
function generateTrackingNumber() {
  const prefix = 'SP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}
