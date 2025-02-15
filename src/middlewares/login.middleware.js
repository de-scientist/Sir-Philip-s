import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const validateLoginInput = async (req, reply) => {
  try {
    await loginSchema.parseAsync(req.body);
    return true;
  } catch (error) {
    return reply.status(400).send({
      success: false,
      error: error.errors[0].message
    });
  }
};

export const checkExistingSession = async (req, reply) => {
  const { token, refreshToken } = req.cookies;
  
  if (token || refreshToken) {
    return reply.status(400).send({
      success: false,
      error: "Already logged in"
    });
  }
  return true;
};
