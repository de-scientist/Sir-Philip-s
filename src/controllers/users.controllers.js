import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { logger } from "../utils/logger.js";

const prisma = new PrismaClient();

// Update user profile validation schema
const updateUserSchema = z.object({
  firstname: z
    .string()
    .min(2, "Firstname should have at least 2 characters")
    .optional(),
  lastname: z
    .string()
    .min(2, "Lastname should have at least 2 characters")
    .optional(),
  phoneNo: z.string().optional(),
  avatar: z.string().optional(),
  
});

export const getProfile = async (request, reply) => {
  try {
    if (!request.user) {
      logger.warn("Profile fetch attempted without user authentication");
      return reply.status(401).send({ message: "Authentication required" });
    }

    const userId = request.user.userId;
    logger.debug("Fetching user profile", { userId });

    if (!userId) {
      logger.warn("Profile fetch attempted without userId");
      return reply.status(400).send({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      logger.warn("User not found", { userId });
      return reply.status(404).send({ message: "User not found" });
    }

    logger.info("User profile fetched successfully", { userId });
    return reply.status(200).send(user);
  } catch (error) {
    console.error(error)
    logger.error("Error fetching user profile", {
      error: error.message,
      stack: error.stack,
      userId: request.user?.userId,
    });
    return reply.status(500).send({ message: "Internal Server Error", error: error });
  }
};

export const getUser = async (request, reply) => {
  try {
    const userId = request.user.userId;
    logger.debug("Fetching user details", { userId });

    if (!userId) {
      logger.warn("User details fetch attempted without userId");
      return reply.status(400).send({ message: "User ID is required" });
    }

    const user = await prisma.user.findUnique({
      where: { userId: userId },
      select:{
        firstname: true,
        lastname: true,
        email: true,
        phoneNo: true,
        createdAt: true,
        avatar: true,
        orders: true,
        reviews: true,
        cart: true
      }
    });
    console.log(user)

    if (!user) {
      logger.warn("User not found", { userId });
      return reply.status(404).send({ message: "User not found" });
    }

    logger.info("User details fetched successfully", { userId });
    return reply.status(200).send(user);
  } catch (error) {
    console.error(error)
    logger.error("Error fetching user profile", {
      error: error.message,
      stack: error.stack,
      userId: request.user?.userId,
    });
    return reply.status(500).send({ message: "Internal Server Error" });
  }
};

// Controller to update user profile
export const updateUserProfile = async (request, reply) => {
  try {
    logger.debug("Update profile attempt", {
      userId: request.user?.userId,
      updates: request.body,
    });

    //Check if the user is authenticated
    if (!request.user?.userId) {
      return reply.status(401).send({
        message: "Authentication required",
        details: "Valid user ID is missing",
      });
    }

    const parsedBody = updateUserSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        message: "Validation failed",
        errors: parsedBody.error.errors,
      });
    }

    // Find user first
    const existingUser = await prisma.user.findUnique({
      where: {
        userId: request.user.userId,
      },
    });

    if (!existingUser) {
      return reply.status(404).send({
        message: "User not found",
        details: `No user found with ID: ${request.user.userId}`,
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        userId: existingUser.userId,
      },
      data: parsedBody.data,
      select: {
        email: true,
        firstname: true,
        lastname: true,
        phoneNo: true,
        avatar: true,
      },
    });

    logger.info("User profile updated successfully", {
      userId: updatedUser.userId,
    });
    return reply.status(200).send({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error)
    logger.error("Error updating user profile", {
      error: error.message,
      code: error.code,
      stack: error.stack,
      userId: request.user?.userId,
    });

    if (error.code === "P2002") {
      return reply.status(409).send({ message: "This data already exists" });
    }

    return reply.status(500).send({
      message: "Internal server error",
      error: {
        name: error.name,
        message: error.message,
        details: error.stack,
      },
    });
  }
};

export const deleteUser = async (request, reply) => {
  try {
    const userId = request.params.userId;

    // Validate if userId is provided
    if (!userId) {
      logger.warn("Delete user attempt without userId");
      return reply.status(400).send({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { userId },
      include: {
        cart: true,
        reviews: true,
        orders: {
          include: {
            orderItems: true,
            Payment: true,
            Delivery: true,
          },
        },
      },
    });

    if (!existingUser) {
      logger.warn(`Delete attempt for non-existent user: ${userId}`);
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // Use transaction to ensure all related data is deleted properly
    await prisma.$transaction(async (tx) => {
      // Delete related cart items first
      if (existingUser.cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: existingUser.cart.id },
        });
        await tx.cart.delete({
          where: { userId },
        });
      }

      // Delete reviews
      await tx.review.deleteMany({
        where: { userId },
      });

      // Delete orders and related data
      for (const order of existingUser.orders) {
        // Delete delivery records
        await tx.delivery.deleteMany({
          where: { orderId: order.id },
        });

        // Delete payment records
        await tx.payment.deleteMany({
          where: { orderId: order.id },
        });

        // Delete order items
        await tx.orderItem.deleteMany({
          where: { orderId: order.id },
        });
      }

      // Delete orders
      await tx.order.deleteMany({
        where: { userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { userId },
      });
    });

    logger.info(`User deleted successfully: ${userId}`);
    return reply.status(200).send({
      success: true,
      message: "User and all related data deleted successfully",
    });
  } catch (error) {
    logger.error("Error deleting user:", {
      error: error.message,
      stack: error.stack,
      userId: request.params.userId,
    });

    return reply.status(500).send({
      success: false,
      message: "Internal server error while deleting user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
