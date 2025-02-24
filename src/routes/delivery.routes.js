import {
  createDelivery,
  getDeliveries,
  getDeliveryById,
  updateDelivery,
  deleteDelivery,
} from "../controllers/delivery.controllers.js";
import {
  validateDeliveryInput,
  checkDeliveryExists,
} from "../middlewares/delivery.middleware.js";

export const deliveryRoutes = (server) => {
  // Create a new delivery with Zod validation
  server.post(
    "/api/delivery",
    { preHandler: [validateDeliveryInput] },
    createDelivery,
  );

  // Get all deliveries
  server.get("/api/deliveries", getDeliveries);

  // Get a delivery by ID
  server.get(
    "/api/deliveries/:id",
    { preHandler: [checkDeliveryExists] },
    getDeliveryById,
  );

  // Update delivery by ID with Zod validation
  server.put(
    "/api/deliveries/:id",
    { preHandler: [checkDeliveryExists, validateDeliveryInput] },
    updateDelivery,
  );

  // Delete delivery by ID
  server.delete(
    "/api/deliveries/:id",
    { preHandler: [checkDeliveryExists] },
    deleteDelivery,
  );
};
