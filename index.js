import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { registerRoutes } from "./src/routes/authRoutes/register.routes.js";
import { loginRouter } from "./src/routes/authRoutes/login.routes.js";
import { logoutRoutes } from "./src/routes/authRoutes/logout.routes.js";
import { productRoutes } from "./src/routes/products.routes.js";
import { categoryRoutes } from "./src/routes/category.routes.js";
import { orderRoutes } from "./src/routes/order.routes.js";
import { reviewRoutes } from "./src/routes/review.routes.js";
import { cartRoutes } from "./src/routes/cart.routes.js";
import { variantRoutes } from "./src/routes/variation.routes.js";
import { refreshTokenRouter } from "./src/routes/authRoutes/refresh.routes.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const server = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
    },
  },
});

server.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "hurry",
  sign: { algorithm: "HS256" },
  verify: { algorithms: ["HS256"] },
});


server.register(fastifyCookie);

server.register(fastifyCors, {
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
});


server.register(fastifyRateLimit, {
  global: true,
  max: 100,
  timeWindow: "1 minute",
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});


registerRoutes(server);
loginRouter(server);
refreshTokenRouter(server);
logoutRoutes(server);
productRoutes(server);
categoryRoutes(server);
orderRoutes(server);
reviewRoutes(server);
cartRoutes(server);
variantRoutes(server);

const start = async () => {
  const HOST = "RENDER" in process.env ? `0.0.0.0` : `localhost`;
  try {
    await server.listen({ host: HOST, port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
