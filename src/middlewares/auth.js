import pkg from "fastify";
const { FastifyReply, FastifyRequest } = pkg;
import winston from "winston";

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

/**
 * Authentication Middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const authenticateUser = async (request, reply) => {
  try {
    // Prioritize token from cookies before headers
    const token = request.cookies.token || request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      logger.warn("Unauthorized access attempt: No token provided");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication token is missing",
      });
    }

    // Verify JWT token
    const decoded = await request.jwtVerify({
      secret: process.env.JWT_SECRET || "hurry",
    });

    // Attach user info to request object
    request.user = {
      id: decoded.id,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      email: decoded.email,
    };

    request.log.info(`User ${decoded.email} authenticated successfully`);
  } catch (err) {
    logger.error(`Authentication failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token",
    });
  }
};

/**
 * Admin Authorization Middleware
 * Ensures only admin users can access certain routes.
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const isAdmin = async (request, reply) => {
  try {
    if (!request.user || request.user.role !== "admin") {
      logger.warn(`Unauthorized admin access attempt by ${request.user?.email || "Unknown User"}`);
      return reply.code(403).send({
        error: "Forbidden",
        message: "Admin privileges required.",
      });
    }
  } catch (err) {
    logger.error(`Authorization failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token",
    });
  }
};

/**
 * User Authorization Middleware
 * Ensures only regular users can access certain routes.
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const isUser = async (request, reply) => {
  try {
    if (!request.user || request.user.role !== "user") {
      logger.warn(`Unauthorized user access attempt by ${request.user?.email || "Unknown User"}`);
      return reply.code(403).send({
        error: "Forbidden",
        message: "User privileges required.",
      });
    }
  } catch (err) {
    logger.error(`Authorization failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token",
    });
  }
};
