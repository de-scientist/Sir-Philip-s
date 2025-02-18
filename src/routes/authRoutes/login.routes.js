import { loginController } from "../../controllers/login.controllers.js";
import { validateLoginInput} from "../../middlewares/login.middleware.js";

export const loginRouter = (server) => {
  server.post("/api/auth/login", {
    preHandler: [validateLoginInput],
    handler: loginController
  });
}; 
