import { PrismaClient } from "@prisma/client";
import os from "os";

const prisma = new PrismaClient();

export const healthRoutes = (server) => {
  server.get("/health", async (request, reply) => {
    const healthInfo = {
      status: "ok",
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        cpus: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      }
    };
    
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthInfo.database = { status: "connected" };
    } catch (error) {
      healthInfo.database = { 
        status: "disconnected",
        error: process.env.NODE_ENV === "production" ? "Database connection error" : error.message
      };
      healthInfo.status = "error";
      return reply.status(500).send(healthInfo);
    }
    
    return reply.send(healthInfo);
  });

  // Simple ping endpoint for load balancers
  server.get("/ping", async (request, reply) => {
    return reply.send("pong");
  });
};
