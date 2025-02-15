import { loginController } from "../../controllers/login.controllers.js";
import { validateLoginInput, checkExistingSession } from "../../middlewares/login.middleware.js";

export const loginRouter = (server) => {
  server.post("/api/auth/login", {
    preHandler: [checkExistingSession, validateLoginInput],
    handler: loginController
  });
};
