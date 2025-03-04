import pkg from "fastify";
const { FastifyReply, FastifyRequest } = pkg;
import { logger } from "../utils/logger.js";

/**
 * Authentication Middleware
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 */
export const authenticateUser = async (request, reply) => {
  const accessToken = request.cookies.accessToken;
  const refreshToken = request.cookies.refreshToken;

  console.log("Here is an AccessToken", accessToken)
  console.log("Here is an RefreshToken", refreshToken)
  if (!accessToken) {
    logger.warn("Unauthorized access attempt: No token provided");
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
      userId: decoded.userId,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
      role: decoded.role,
      email: decoded.email
    };

    request.log.info(`User ${decoded.userId} authenticated successfully`);
    return;
  } catch (err) {
    // Handle token verification errors
    if (err.code === "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED" && refreshToken) {
      try {
        // Verify refresh token
        const decoded = await request.jwtVerify(refreshToken, {
          sign: { sub: "refresh" },
        });

        // Generate new access token
        const newAccessToken = await reply.jwtSign(
          { ...decoded, sub: "access" },
          { expiresIn: "1h" },
        );

        // Set new access token in cookie
        reply.setCookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });

        // Update request.user
        request.user = {
          id: decoded.id,
          firstname: decoded.firstname,
          lastname: decoded.lastname,
          role: decoded.role,
          email: decoded.email,
        };

        return;
      } catch (refreshErr) {
        console.error(refreshErr)
        logger.error(`Refresh token validation failed: ${refreshErr.message}`);
        return reply.code(401).send({
          message: "Invalid refresh token. Please login again.",
        });
      }
    }

    logger.error(`Authentication failed: ${err.message}`);
    return reply.code(401).send({
      error: "Unauthorized",
      message: "Invalid or expired authentication token",
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
      logger.warn(
        `Unauthorized admin access attempt by ${request.user?.email}`,
      );
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
      logger.warn(
        `Unauthorized user access attempt by ${request.user?.email || "Unknown User"}`,
      );
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
