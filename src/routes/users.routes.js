import {
  getUser,
  updateUserProfile,
  deleteUser,
} from "../controllers/users.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

export const userRoutes = (server) => {
  // Get User Profile - This route is protected by authenticateUser middleware
  server.get("/api/users/profile", {
    preHandler: [authenticateUser],
    handler: getUser,
  });

  // Update User Profile - This route is protected by authenticateUser middleware
  server.put("/api/users/profile", { handler: updateUserProfile });

  // Delete User - This route is protected by authenticateUser and isAdmin middleware
  server.delete("/api/users/:userId", {
    preHandler: [authenticateUser, isAdmin],
    handler: deleteUser,
  });
};
