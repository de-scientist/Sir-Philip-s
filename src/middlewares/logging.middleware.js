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
 * Logging Middleware
 * Logs request method and URL
 */
export const loggingMiddleware = (req, reply, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.url} from ${req.ip}`);
  next();
};
