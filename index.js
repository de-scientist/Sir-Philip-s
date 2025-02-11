import Fastify from "fastify";
import { config } from "./env.js"; // Import configurations from env.js
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
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

const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

// Register JWT
server.register(fastifyJwt, {
  secret: config.JWT_SECRET,
  sign: { algorithm: "HS256" },
  verify: { algorithms: ["HS256"] },
});

// Register @fastify/cookie with secure options
server.register(fastifyCookie, {
  secret: config.COOKIE_SECRET, // Encrypt signed cookies
  hook: "onRequest",
  parseOptions: {
    httpOnly: true, // Prevent JavaScript access
    secure: config.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "Strict", // Prevent CSRF attacks
  },
});

// Register middleware
server.addHook("preHandler", loggingMiddleware);
server.addHook("preHandler", (req, reply, done) => {
  reply.header("Access-Control-Allow-Origin", "*");
  reply.header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
  reply.header("Access-Control-Allow-Headers", "*");
  const isPreflight = /options/i.test(req.method);
  if (isPreflight) {
    return reply.send();
  }
  done();
});

// Register rate limiting
server.register(fastifyRateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});

// Register the routes
registerRoutes(server);
loginRouter(server);
logoutRoutes(server);
productRoutes(server);
categoryRoutes(server);
orderRoutes(server);
reviewRoutes(server);
cartRoutes(server);
variantRoutes(server);

const start = async () => {
  const HOST = config.NODE_ENV === "production" ? `0.0.0.0` : `localhost`;
  try {
    await server.listen({ host: HOST, port: config.PORT });
    console.log(`Server listening on port ${config.PORT}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
