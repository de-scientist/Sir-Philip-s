import { loginController } from "../../controllers/login.controllers.js";

export const loginRouter = (server) => {
  server.post("/api/auth/login", loginController);
};
