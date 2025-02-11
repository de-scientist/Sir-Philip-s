import { refreshTokenController } from "../../controllers/refreshToken.controllers.js";

export const refreshTokenRouter = (server) => {
  server.post("/api/auth/refresh", refreshTokenController);
};