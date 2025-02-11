import winston from "winston";

// Logger configuration
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      }),
    })
  );
}

/**
 * Authentication Middleware
 * Extracts JWT from cookies instead of headers.
 */
export const authMiddleware = async (req, reply, next) => {
  try {
    // ✅ Extract JWT from HTTP-only cookies
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized access attempt - No token provided");
      return reply.status(401).send({ data: { message: "Unauthorized. Please log in." } });
    }

    // ✅ Verify token
    try {
      const decoded = req.server.jwt.verify(token);
      req.user = decoded; // Attach decoded user info to request
      next(); // Proceed to the next middleware
    } catch (error) {
      logger.error(`Invalid token: ${error.message}`);
      return reply.status(403).send({ data: { message: "Invalid or expired token. Please log in again." } });
    }
  } catch (error) {
    logger.error(`Authentication Middleware Error: ${error.message}`);
    return reply.status(500).send({ data: { message: "Authentication error. Please try again later." } });
  }
};
