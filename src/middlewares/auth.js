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
    }),
  );
}

/**
 * User role check middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const authenticateUser = async (request, reply) => {
  try {
    const token =
      request.headers.authorization?.replace("Bearer ", "") ||
      request.cookies.token;

    if (!token) {
      logger.info("Unauthorized access attempt: No token provided");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "No token provided",
      });
    }
    // Verify JWT token
    const decoded = await request.jwtVerify({
      secret: process.env.JWT_SECRET || "hurry",
    });

    // Add user to request for later use
    request.user = {
      id: decoded.id,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      email: decoded.email,
    };

    request.log.info(`User ${decoded.id} with ${decoded.firstname} authenticated successfully`);
    return;
  } catch (err) {
    logger.info(`Authentication failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: err.message,
    });
  }
};

// Admin Authentication
/**
 * User role check middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const isAdmin = async (request, reply) => {
  try {
    await request.jwtVerify();
    const user = request.user;

    if (!user || user.role !== "admin") {
      logger.info("Unauthorized access attempt: Only Admins.");
      return reply.code(403).send({
        error: "Access denied. Admins Only",
        message: "Admin privileges required.",
      });
    }
    return;
  } catch (err) {
    logger.info("Authentication failed: " + err.message);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};

/**
 * User role check middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const isUser = async (request, reply) => {
  try {
    await request.jwtVerify();
    const user = request.user;

    if (!user || user.role !== "user") {
      logger.info(`Unauthorized access from email: ${decoded.email}`);
      return reply.code(403).send({
        error: "Access denied",
        message: "User privileges required",
      });
    }
    return;
  } catch (err) {
    logger.info(`Unauthorized access from email: ${decoded.email}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
};
