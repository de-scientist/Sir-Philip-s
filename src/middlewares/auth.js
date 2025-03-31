import pkg from "fastify";
const { FastifyReply, FastifyRequest } = pkg;
import { logger } from "../utils/logger.js";

/**
 * Authentication Middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const authenticateUser = async (request, reply) => {
  const token = request.cookies.authToken;
  
  if (!token) {
    logger.warn("Unauthorized access attempt: No token provided");
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Authentication token is missing"
    });
  }

  try {
    // Verify the token
    const decoded = await request.jwtVerify(token);

    // Attach user info to request object
    request.user = {
      userId: decoded.userId,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      email: decoded.email
    };

    // Check if token is nearing expiration (less than 2 hours remaining)
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    if (expiresIn < 86400) {
      // Silently refresh token if it's close to expiration
      const newToken = await reply.jwtSign(
        { ...decoded, iat: Math.floor(Date.now() / 1000) },
        { expiresIn: "24h" }
      );
      
      // Set new token in cookie
      reply.setCookie("authToken", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    return;
  } catch (err) {
    logger.error(`Authentication failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token"
    });
  }
};

/**
 * Admin Authorization Middleware
 */
export const isAdmin = async (request, reply) => {
  try {
    if (!request.user || request.user.role !== "admin") {
      logger.warn(`Unauthorized admin access attempt by ${request.user?.email || "Unknown"}`);
      return reply.code(403).send({
        error: "Forbidden",
        message: "Admin privileges required."
      });
    }
  } catch (err) {
    logger.error(`Authorization failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token"
    });
  }
};

/**
 * User Authorization Middleware
 */
export const isUser = async (request, reply) => {
  try {
    if (!request.user || request.user.role !== "user") {
      logger.warn(`Unauthorized user access attempt by ${request.user?.email || "Unknown User"}`);
      return reply.code(403).send({
        error: "Forbidden",
        message: "User privileges required."
      });
    }
  } catch (err) {
    logger.error(`Authorization failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token"
    });
  }
};
