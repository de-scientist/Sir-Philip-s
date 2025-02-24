export const loggingMiddleware = (req, reply, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

export const authMiddleware = async (req, reply, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      logger.warn("Unauthorized access attempt - No token provided");
      return reply
        .status(401)
        .send({ data: { message: "Unauthorized. Please log in." } });
    }

    try {
      const decoded = req.server.jwt.verify(token);
      req.user = decoded;
      next();
    } catch (error) {
      logger.error(`Invalid token: ${error.message}`);
      return reply
        .status(403)
        .send({
          data: { message: "Invalid or expired token. Please log in again." },
        });
    }
  } catch (error) {
    logger.error(`Authentication Middleware Error: ${error.message}`);
    return reply
      .status(500)
      .send({
        data: { message: "Authentication error. Please try again later." },
      });
  }
};
