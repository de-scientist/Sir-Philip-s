import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Disconnect the Prisma Client when the app shuts down
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
} else {
  prisma.$connect().catch(e => {
    console.error("Failed to connect to the database", e);
  });
}

export default prisma;
