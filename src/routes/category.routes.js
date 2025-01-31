import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import { authenticateUser } from "../middlewares/auth.js";
import { checkCategoryExists, validateCategoryInput, categoryLoggingMiddleware } from "../middlewares/category.middleware.js";

export const categoryRoutes = (server) => {
  // Create a new category
  server.post("/api/categories", {
    preHandler: [authenticateUser, validateCategoryInput, categoryLoggingMiddleware],
    handler: createCategory,
  });

  // Get all categories
  server.get("/api/categories", { handler: getCategories });

  // Get category by ID
  server.get("/api/categories/:id", {
    preHandler: [checkCategoryExists, categoryLoggingMiddleware],
    handler: getCategoryById,
  });

  // Update category by ID
  server.put("/api/categories/:id", {
    preHandler: [authenticateUser, checkCategoryExists, validateCategoryInput, categoryLoggingMiddleware],
    handler: updateCategory,
  });

  // Delete category by ID
  server.delete("/api/categories/:id", {
    preHandler: [authenticateUser, checkCategoryExists, categoryLoggingMiddleware],
    handler: deleteCategory,
  });
};
