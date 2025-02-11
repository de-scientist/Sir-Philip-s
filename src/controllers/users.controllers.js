import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient'; // Assuming you have prisma setup
import { z } from 'zod';

// Zod schemas for validation

// Register user validation schema
const registerSchema = z.object({
  firstname: z.string().min(2, 'Firstname should have at least 2 characters'),
  lastname: z.string().min(2, 'Lastname should have at least 2 characters'),
  email: z.string().email('User does not exist. Please register.'),
  password: z.string().min(8, 'Password should have at least 8 characters'),
  phoneNo: z.string().optional(),
  avatar: z.string().optional(),
});

// Login user validation schema
const loginSchema = z.object({
  email: z.string().email('User does not exist. Please register.'),
  password: z.string().min(8, 'Password should have at least 8 characters'),
});

// Update user profile validation schema
const updateUserSchema = z.object({
  firstname: z.string().min(2, 'Firstname should have at least 2 characters').optional(),
  lastname: z.string().min(2, 'Lastname should have at least 2 characters').optional(),
  phoneNo: z.string().optional(),
  avatar: z.string().optional(),
});

// Controller to handle user registration
export const registerUser = async (request, reply) => {
  try {
    // Validate the request body using Zod
    const parsedBody = registerSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        message: 'Email or password is incorrect.',
        errors: parsedBody.error.errors,
      });
    }

    const { firstname, lastname, email, password, phoneNo, avatar } = parsedBody.data;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return reply.status(400).send({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phoneNo,
        avatar,
      },
    });

    return reply.status(201).send({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Error in registration:', error);
    return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};

// Controller to handle user login
export const loginUser = async (request, reply) => {
  try {
    // Validate the request body using Zod
    const parsedBody = loginSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        message: 'Email or password is incorrect.',
        errors: parsedBody.error.errors,
      });
    }

    const { email, password } = parsedBody.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return reply.status(404).send({ message: 'User not found' });
    }

    // Compare password with hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return reply.status(401).send({ message: 'Invalid password' });
    }

    // Generate JWT token (using @fastify/jwt)
    const token = reply.jwt.sign({ userId: user.userId });

    return reply.status(200).send({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error in login:', error);
    return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};

// Controller to get user data
export const getUser = async (request, reply) => {
  try {
    const userId = request.user.userId; // Assuming you're using JWT authentication

    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        orders: true, // Include related orders if needed
        reviews: true, // Include related reviews if needed
        cart: true,    // Include related cart if needed
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
    // Validate the request body using Zod
    const parsedBody = updateUserSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return reply.status(400).send({
        message: 'Email or password is incorrect.',
        errors: parsedBody.error.errors,
      });
    }

    const userId = request.user.userId;
    const { firstname, lastname, phoneNo, avatar } = parsedBody.data;

    // Update the user's profile
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        firstname,
        lastname,
        phoneNo,
        avatar,
      },
    });

    return reply.status(200).send({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error in updating user profile:', error);
    return reply.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
};
