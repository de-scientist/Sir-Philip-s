import { logger } from "../utils/logger.js";

/**
 * Middleware to validate token before allowing logout
 * Ensures that only authenticated users can logout
 */
export const validateToken = async (request, reply) => {
  try {
    const token = request.cookies.authToken;

    if (!token) {
      logger.warn("Logout attempted without authentication token");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "You must be logged in to logout"
      });
    }

    // Just verify the token is valid, no need to store the result
    await request.jwtVerify(token);
    
    // If token verification succeeds, let the request continue to the logout handler
    return;
  } catch (error) {
    logger.warn("Invalid authentication token during logout attempt", { 
      error: error.message 
    });
    
    // Even if the token is invalid, we should clear it during logout
    // So we'll still let the request continue to the logout handler
    return;
  }
};
