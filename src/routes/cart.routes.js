import {
  createCart,
  getCart,
  updateCart,
  deleteCart,
  addProductToCart,
  deleteProductFromCart,
  addQuantityToCart,
  deleteQuantityFromCart,
} from "../controllers/cart.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const cartRoutes = (server) => {
  server.post("/api/cart", {
    preHandler: [authenticateUser],
    handler: createCart,
  });
  server.get("/api/cart", { preHandler: [authenticateUser], handler: getCart });
  server.put("/api/cart", {
    preHandler: [authenticateUser],
    handler: updateCart,
  });
  server.delete("/api/cart", {
    preHandler: [authenticateUser],
    handler: deleteCart,
  });
  server.post("/api/cart/add", {
    preHandler: [authenticateUser],
    handler: addProductToCart,
  });
  server.post("/api/cart/delete", {
    preHandler: [authenticateUser],
    handler: deleteProductFromCart,
  });
  server.post("/api/cart/add-quantity/:id", {
    preHandler: [authenticateUser],
    handler: addQuantityToCart,
  });
  server.post("/api/cart/delete-quantity/:id", {
    preHandler: [authenticateUser],
    handler: deleteQuantityFromCart,
  });
};
