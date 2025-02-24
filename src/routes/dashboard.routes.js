import { getDashboardMetrics } from "../controllers/dashboard.controllers.js";
import { authenticateUser, isAdmin } from "../middlewares/auth.js";

export const dashboardRoutes = async (server) => {
  server.get("/api/dashboard/metrics", {
    // preHandler: [authenticateUser, isAdmin],
    handler: getDashboardMetrics,
  });
};
