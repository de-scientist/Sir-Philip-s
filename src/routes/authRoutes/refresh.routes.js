import { refreshTokenController } from "../../controllers/refreshToken.controllers.js";
import { validateRefreshToken } from "../../middlewares/refreshToken.middleware.js";

export const refreshTokenRoutes = (server) => {
  server.post("/api/auth/refresh", {
    preHandler: [validateRefreshToken],
    handler: refreshTokenController,
  });
};
