import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";
import {
  checkCategoryExists,
  validateCategoryInput,
} from "../middlewares/category.middleware.js";

export const categoryRoutes = (server) => {
  // Create a new category
  server.post("/api/categories", {
    preHandler: [authenticateUser, isAdmin, validateCategoryInput],
    handler: createCategory,
  });

  // Get all categories
  server.get("/api/categories", { handler: getCategories });

  // Get category by ID
  server.get("/api/categories/:id", {
    preHandler: [checkCategoryExists],
    handler: getCategoryById,
  });

  // Update category by ID
  server.put("/api/categories/:id", {
    // preHandler: [authenticateUser, isAdmin, checkCategoryExists, validateCategoryInput],
    handler: updateCategory,
  });

  // Delete category by ID
  server.delete("/api/categories/:id", {
    preHandler: [authenticateUser, isAdmin, checkCategoryExists],
    handler: deleteCategory,
  });
};
