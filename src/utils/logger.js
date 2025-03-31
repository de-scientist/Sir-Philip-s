import winston, { format } from "winston";
import path from "path";

const isProd = process.env.NODE_ENV === "production";
const logDir = isProd ? "/var/log/sir-philip" : "./logs";

// Create format for console and file logging
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Console format with colors for development
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length 
      ? `\n${JSON.stringify(meta, null, 2)}` 
      : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

// Logger configuration
const Logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  format: logFormat,
  defaultMeta: { service: "sir-philip-service" },
  transports: [
    // Production logs are written to files with daily rotation
    ...(!isProd ? [] : [
      new winston.transports.File({ 
        filename: path.join(logDir, "error.log"), 
        level: "error",
        maxsize: 10485760, // 10MB
        maxFiles: 10
      }),
      new winston.transports.File({ 
        filename: path.join(logDir, "combined.log"),
        maxsize: 10485760, // 10MB
        maxFiles: 10
      })
    ]),
    
    // Console logging (pretty in development, JSON in production)
    new winston.transports.Console({
      format: isProd ? logFormat : consoleFormat
    })
  ],
});

// Create a simplified logger interface with additional context capabilities
export const logger = {
  info: (message, meta = {}) => Logger.info(message, meta),
  error: (message, meta = {}) => Logger.error(message, meta),
  warn: (message, meta = {}) => Logger.warn(message, meta),
  debug: (message, meta = {}) => Logger.debug(message, meta),
  http: (message, meta = {}) => Logger.http(message, meta),
  
  // Add request context info to logs
  contextLogger: (req) => {
    const requestId = req.id;
    const requestInfo = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.userId
    };
    
    return {
      info: (message, meta = {}) => Logger.info(message, { ...requestInfo, ...meta }),
      error: (message, meta = {}) => Logger.error(message, { ...requestInfo, ...meta }),
      warn: (message, meta = {}) => Logger.warn(message, { ...requestInfo, ...meta }),
      debug: (message, meta = {}) => Logger.debug(message, { ...requestInfo, ...meta }),
      http: (message, meta = {}) => Logger.http(message, { ...requestInfo, ...meta }),
    };
  }
};
