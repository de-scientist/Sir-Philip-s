import { logger } from "../utils/logger.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

export function errorHandler(error, request, reply) {
  const isProd = process.env.NODE_ENV === "production";
  
  // Log the error
  logger.error(`[${request.method}] ${request.url}`, {
    error: error.message,
    stack: isProd ? undefined : error.stack,
    params: request.params,
    query: request.query,
    body: isProd ? undefined : request.body,
  });

  // Handle specific error types
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation error",
      issues: error.issues,
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return reply.status(409).send({
        statusCode: 409,
        error: "Conflict",
        message: "Resource already exists",
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: "Resource not found",
      });
    }
  }

  if (error instanceof PrismaClientValidationError) {
    return reply.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Database validation error",
    });
  }

  // JWT verification errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE' ||
      error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  // Default error handler for unhandled errors
  const statusCode = error.statusCode || 500;
  const errorMessage = isProd && statusCode === 500 
    ? "Internal Server Error" 
    : error.message;
  
  return reply.status(statusCode).send({
    statusCode,
    error: error.name || "Error",
    message: errorMessage,
  });
}
