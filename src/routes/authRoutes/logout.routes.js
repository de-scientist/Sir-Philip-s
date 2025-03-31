import { logoutController } from "../../controllers/logout.controllers.js";
import { authenticateUser } from "../../middlewares/auth.js";
import { validateToken } from "../../middlewares/logout.middleware.js";

export const logoutRoutes = (server) => {
  server.post("/api/auth/logout", {
    preHandler: [authenticateUser, validateToken],
    handler: logoutController,
  });
};
