import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createMany,
  filterProducts,
  searchProducts,
} from "./../controllers/product.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";

export const productRoutes = (server) => {
  server.get("/api/products", { handler: getProducts });
  server.get("/api/products/filter", { handler: filterProducts });
  server.get("/api/products/search", { handler: searchProducts });
  server.get("/api/product/:id", { handler: getProductById });
  server.post("/api/products", {
    preHandler: [authenticateUser],
    handler: createProduct,
  });
  server.post("/api/:categoryId/products", {
    preHandler: [authenticateUser],
    handler: createMany,
  });
  server.put("/api/products/:id", {
    preHandler: [authenticateUser],
    handler: updateProduct,
  });
  server.delete("/api/products/:id", {
    preHandler: [authenticateUser],
    handler: deleteProduct,
  });
};
