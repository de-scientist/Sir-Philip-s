import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Update user profile validation schema
const updateUserSchema = z.object({
  firstname: z.string().min(2, 'Firstname should have at least 2 characters').optional(),
  lastname: z.string().min(2, 'Lastname should have at least 2 characters').optional(),
  phoneNo: z.string().optional(),
  avatar: z.string().optional(),
  role: z.string()
});

export const getUser = async (request, reply) => {
  try {
    const userId = request.user.id; // Changed from userId to id

    if (!userId) {
      return reply.status(400).send({ message: 'User ID is required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }, // Changed from userId to id
      include: {
        orders: true, 
        reviews: true, 
        cart: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    return reply.status(200).send(user);
  } catch (error) {
    console.error('Error in fetching user data:', error);
    return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};

// Controller to update user profile
export const updateUserProfile = async (request, reply) => {
  try {
    console.log('Request user object:', request.user);

    if (!request.user?.userId) {
      return reply.status(401).send({ 
        message: 'Authentication required',
        details: 'Valid user ID is missing'
      });
    }

    const parsedBody = updateUserSchema.safeParse(request.body);
    
    if (!parsedBody.success) {
      return reply.status(400).send({
        message: 'Validation failed',
        errors: parsedBody.error.errors,
      });
    }

    // Find user first
    const existingUser = await prisma.user.findUnique({
      where: { 
        userId: request.user.userId
      }
    });

    if (!existingUser) {
      return reply.status(404).send({ 
        message: 'User not found',
        details: `No user found with ID: ${request.user.userId}`
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { 
        userId: existingUser.userId
      },
      data: parsedBody.data,
      select: {
        userId: true,
        email: true,
        firstname: true,
        lastname: true,
        phoneNo: true,
        avatar: true,
        role: true
      }
    });

    return reply.status(200).send({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    if (error.code === 'P2002') {
      return reply.status(409).send({ message: 'This data already exists' });
    }

    return reply.status(500).send({ 
      message: 'Internal server error',
      error: {
        name: error.name,
        message: error.message,
        details: error.stack
      }
    });
  }
};
