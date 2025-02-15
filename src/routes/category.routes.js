import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";
import { checkCategoryExists, validateCategoryInput} from "../middlewares/category.middleware.js";

export const categoryRoutes = (server) => {
  server.get("/api/categories", { handler: getCategories });
  server.post("/api/categories", {
    preHandler: [authenticateUser,isAdmin, validateCategoryInput],
    handler: createCategory,
  });
  server.get("/api/categories/:id", {
    preHandler: [checkCategoryExists],
    handler: getCategoryById,
  });
  server.put("/api/categories/:id", {
    preHandler: [authenticateUser, checkCategoryExists, validateCategoryInput],
    handler: updateCategory,
  });
  server.delete("/api/categories/:id", {
    preHandler: [authenticateUser, checkCategoryExists],
    handler: deleteCategory,
  });
};
