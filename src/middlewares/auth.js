import winston from "winston";

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
    new winston.transports.Console({ format: winston.format.simple() })
  );
}

export const authenticateUser = async (request, reply) => {
  try {
    const accessToken = request.cookies.access_token;
    if (!accessToken) {
      logger.warn("Unauthorized access attempt - No token provided");
      return reply.code(401).send({ message: "Unauthorized, please login" });
    }

    try {
      const decoded = await request.jwtVerify(accessToken);
      request.user = decoded;
    } catch (err) {
      logger.error(`Invalid token: ${error.message}`);
      return reply.code(401).send({ message: "Invalid token, please login" });
    }
  } catch (err) {
    logger.error(`Authentication Error: ${err.message}`);
    return reply.code(500).send({ message: "Something went wrong" });
  }
};

export const isAdmin = async (request, reply) => {
  if (!request.user || request.user.role !== "admin") {
    return reply
      .code(403)
      .send({ error: "Forbidden", message: "Admin privileges required." });
  }
};

export const isUser = async (request, reply) => {
  if (!request.user || request.user.role !== "user") {
    return reply
      .code(403)
      .send({ error: "Forbidden", message: "User privileges required." });
  }
};
