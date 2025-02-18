import winston, { format } from "winston";

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
)
// Logger configuration
const Logger = winston.createLogger({
  level: "info",
  format: logFormat,
  defaultMeta: {service: 'sir-philip-service'},
  transports: [
    //Write all logs with level 
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Add console transport in non-production environments
if (process.env.NODE_ENV !== "production") {
  Logger.add(
    new winston.transports.Console({
      format: winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      }),
    })
  );
}

export const logger = {
    info: (message, meta = {}) => Logger.info(message, meta),
    error: (message, meta = {}) => Logger.error(message, meta),
    warn: (message, meta = {}) => Logger.warn(message, meta),
    debug: (message, meta = {}) => Logger.debug(message, meta),
    http: (message, meta = {}) => Logger.http(message, meta)
};