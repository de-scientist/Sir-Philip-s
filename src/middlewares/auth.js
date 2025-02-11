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
    // Extract tokens from cookies
    const accessToken = request.cookies.access_token;
    const refreshToken = request.cookies.refresh_token;

    if (!accessToken) {
      logger.warn("Unauthorized access attempt: No access token provided");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Authentication token is missing",
      });
    }

    try {
      // Verify the access token
      const decoded = await request.jwtVerify(accessToken);

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
      // If access token is expired, check for refresh token
      if (refreshToken) {
        request.log.warn(`Access token expired for ${request.user?.email}. Checking refresh token...`);
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Access token expired. Please refresh your session.",
        });
      } else {
        logger.error(`Authentication failed: ${err.message}`);
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid or expired authentication token",
        });
      }
    }
  } catch (err) {
    logger.error(`Authentication middleware error: ${err.message}`);
    return reply.code(500).send({
      error: "Internal Server Error",
      message: "An error occurred during authentication.",
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
