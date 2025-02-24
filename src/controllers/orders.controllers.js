import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

const orderItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be a positive integer")
});

const orderSchema = z.object({
  items: z.array(orderItemSchema),
  paymentMethod: z.enum(['mpesa', 'credit', 'bank']),
  deliveryFee: z.number().default(120.00),
  total: z.number().positive("Total amount must be a positive number")
});

const deleteOrdersSchema = z.object({
  orderIds: z.array(z.string().uuid("Invalid order ID")),
});

export const createOrder = async (req, reply) => {
  try {
    const data = orderSchema.parse(req.body);
    const userId = req.user.userId;

    // Calculate subtotal from items
    const productsWithPrices = await Promise.all(
      data.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
           select: { id: true, currentPrice: true, stock: true }
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        return {
          ...item,
          price: product.currentPrice
        };
      })
    );

    const subtotal = productsWithPrices.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Verify total matches subtotal + deliveryFee
    const expectedTotal = subtotal + data.deliveryFee;
    if (Math.abs(expectedTotal - data.total) > 0.01) {
      throw new Error('Total amount does not match items total plus delivery fee');
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalAmount: data.total,
          subtotal,
          deliveryFee: data.deliveryFee,
          paymentMethod: data.paymentMethod,
          orderItems: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          orderItems: true
        }
      });

      // Update product stock
      await Promise.all(
        data.items.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          })
        )
      );

      return newOrder;
    });

    logger.info('Order created successfully', { orderId: order.id });
    reply.status(201).send({
      id: order.id,
      items: order.orderItems,
      paymentMethod: order.paymentMethod,
      total: order.totalAmount,
      deliveryFee: order.deliveryFee,
      subtotal: order.subtotal,
      status: order.status
    });

  } catch (error) {
    console.error(error);
    logger.error('Failed to create order', { error: error.message });
    if (error instanceof z.ZodError) {
      reply.status(400).send({ 
        message: "Validation error", 
        errors: error.errors 
      });
    } else {
      reply.status(500).send({ 
        message: error.message || "Failed to create order" 
      });
    }
  }
};

export const getOrders = async (req, reply) => {
  try {
    logger.info("Fetching all orders");
    const orders = await prisma.order.findMany({
      include: {
        orderItems: true,
      },
    });

    logger.info(`Fetched ${orders.length} orders`);
    reply.status(200).send(orders);
  } catch (error) {
    logger.error(`Failed to fetch orders: ${error.message}`);
    reply.status(500).send({ error: error });
  }
};

export const getOrdersByStatus = async (req, reply) => {
  try {
    const { status } = req.params;
    logger.info(`Fetching orders with status: ${status}`);

    const orders = await prisma.order.findMany({
      where: { status },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc", // Sort by creation date in descending order
      },
    });

    if (orders.length === 0) {
      reply
        .status(404)
        .send({ message: `No orders found with status: ${status}` });
    } else {
      logger.info(`Fetched ${orders.length} orders with status: ${status}`);
      reply.status(200).send(orders);
    }
  } catch (error) {
    logger.error(`Failed to fetch orders by status: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to display the status records." });
  }
};

export const getOrderById = async (req, reply) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                currentPrice: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return reply.status(404).send({ message: "Order not found" });
    }

    reply.send({
      id: order.id,
      items: order.orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.product.name,
        price: item.product.currentPrice
      })),
      paymentMethod: order.paymentMethod,
      total: order.totalAmount,
      deliveryFee: order.deliveryFee,
      subtotal: order.subtotal,
      status: order.status,
      createdAt: order.createdAt
    });

  } catch (error) {
    logger.error('Failed to fetch order', { error: error.message });
    reply.status(500).send({ message: "Failed to fetch order" });
  }
};

export const updateOrder = async (req, reply) => {
  try {
    const orderId = req.params.id;
    logger.info(`Updating order with ID: ${orderId}`);
    const data = orderSchema.parse(req.body);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        totalAmount: data.totalAmount,
        status: data.status,
        orderItems: {
          deleteMany: {},
          create: data.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    logger.info(`Order updated successfully with ID: ${order.id}`);
    reply.status(200).send(order);
  } catch (error) {
    logger.error(`Failed to update order: ${error.message}`);
    if (error instanceof z.ZodError) {
      logger.info(`Failed to create the order: ${("Error :", error)}`);
      reply.status(400).send({ message: "Failed to update the order" });
    }
    reply.status(500).send({ error: "Failed to update order" });
  }
};

export const deleteOrder = async (req, reply) => {
  try {
    const orderId = req.params.id;
    logger.info(`Deleting order with ID: ${orderId}`);

    const confRecord = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!confRecord) {
      logger.info(`The ${("Order:", orderId)} does not exist.`);
      reply.status(200).send({ message: "The order does not exist." });
    }

    await prisma.orderItem.deleteMany({
      where: { orderId: orderId },
    });

    await prisma.order.delete({
      where: { id: orderId },
    });

    logger.info(`Order deleted successfully with ID: ${orderId}`);
    reply.status(200).send({ message: "Order successfully deleted." });
  } catch (error) {
    console.error("Error :", error);
    logger.error(`Failed to delete order: ${error.message}`);
    reply
      .status(500)
      .send({ message: "Failed to delete order.", error: error });
  }
};

export const deleteOrders = async (req, reply) => {
  try {
    logger.info("Starting to delete multiple orders");
    const { orderIds } = deleteOrdersSchema.parse(req.body);

    const confRecord = await prisma.order.findMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });
    if (confRecord.length === 0) {
      logger.info(`No orders found with the provided IDs`);
      return reply.status(404).send({ message: "The orders do not exist." });
    }

    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    const deleteResult = await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    if (deleteResult.count === 0) {
      logger.info(`Failed to delete for no orders were found to delete.`);
      reply.status(404).send({ message: "No orders found to delete" });
    } else {
      logger.info(`Deleted ${deleteResult.count} orders successfully`);
      reply
        .status(200)
        .send({ message: `Deleted ${deleteResult.count} orders successfully` });
    }
  } catch (error) {
    logger.error(`Failed to delete orders: ${error.message}`);
    if (error instanceof z.ZodError) {
      reply.status(400).send({ message: error.errors });
    } else {
      reply
        .status(500)
        .send({ message: "Failed to delete orders", error: error });
    }
  }
};
