import Fastify from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import { registerRoutes } from "./src/routes/authRoutes/register.routes.js";
import { loggingMiddleware } from "./src/middlewares/logging.middleware.js";
import { loginRouter } from "./src/routes/authRoutes/login.routes.js";
import { logoutRoutes } from "./src/routes/authRoutes/logout.routes.js";
import { productRoutes } from "./src/routes/products.routes.js";
import { categoryRoutes } from "./src/routes/category.routes.js";
import { orderRoutes } from "./src/routes/order.routes.js";
import { reviewRoutes } from "./src/routes/review.routes.js";
import { cartRoutes } from "./src/routes/cart.routes.js";
import { variantRoutes } from "./src/routes/variation.routes.js";
import { userRoutes } from "./src/routes/users.routes.js";
import { dashboardRoutes } from "./src/routes/dashboard.routes.js";
import { deliveryRoutes } from "./src/routes/delivery.routes.js";
import { healthRoutes } from "./src/routes/health.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// Server configuration
const server = Fastify({
  logger: {
    level: isProd ? "info" : "debug",
    transport: isProd 
      ? undefined 
      : {
          target: "pino-pretty",
          options: { translateTime: "HH:MM:ss Z", ignore: "pid,hostname" }
        }
  },
  trustProxy: isProd, // Enable this when behind a reverse proxy like Nginx
  disableRequestLogging: isProd, // Disable request logging in production for better performance
});

// Register security plugins
// server.register(fastifyHelmet, {
//   contentSecurityPolicy: isProd ? undefined : false,
// });

server.register(fastifyCompress);

// Register JWT with production configuration
server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
  sign: {
    algorithm: "HS256",
    expiresIn: "24h",
    issuer: "sir-philip-ecommerce",
  },
  verify: { 
    algorithms: ["HS256"],
    issuer: "sir-philip-ecommerce",
  },
  cookie: {
    cookieName: 'authToken',
    signed: false
  }
});

// Register cookie with secure configuration
server.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET, 
  hook: "onRequest",
  parseOptions: {
    httpOnly: true,
    secure: isProd, 
    sameSite: "strict",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

// Add logging middleware
server.addHook("preHandler", loggingMiddleware);

// Configure CORS for production
server.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      "http://localhost:5174",
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      cb(null, true);
      return;
    }
    cb(new Error("CORS policy violation"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  exposedHeaders: ["X-CSRF-Token"],
  credentials: true,
});

// Add rate limiting with different settings for production
server.register(fastifyRateLimit, {
  global: true,
  max: isProd ? 60 : 100,
  timeWindow: "1 minute",
  allowList: ["127.0.0.1"],
  errorResponseBuilder: (req, context) => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: `Rate limit exceeded, retry in ${context.after}`,
  }),
});

// Add global error handler
server.setErrorHandler(errorHandler);

// Register routes
registerRoutes(server);
userRoutes(server);
loginRouter(server);
logoutRoutes(server);
productRoutes(server);
categoryRoutes(server);
orderRoutes(server);
reviewRoutes(server);
cartRoutes(server);
variantRoutes(server);
dashboardRoutes(server);
deliveryRoutes(server);
healthRoutes(server); // Add health routes

// Add shutdown hook for graceful termination
const closeGracefully = async (signal) => {
  console.log(`Received signal ${signal}, shutting down gracefully`);
  await server.close();
  // Close database connections if needed
  await prisma.$disconnect();
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

// Start server
const start = async () => {
  const HOST = isProd ? `0.0.0.0` : `localhost`;
  try {
    await server.listen({ host: HOST, port: parseInt(process.env.PORT || "3000") });
    console.log(`Server listening on port ${process.env.PORT || 3000} in ${process.env.NODE_ENV} mode`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
