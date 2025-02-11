import { logout } from "../../controllers/logout.controllers.js";

export const logoutRoutes = (server) => {
  server.post("/api/auth/logout", logout);
};
