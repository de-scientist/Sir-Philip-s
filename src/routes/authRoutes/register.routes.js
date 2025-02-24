import { registerUser } from "../../controllers/register.controllers.js";
import {
  validateRegistrationInput,
  checkIfEmailExists,
} from "../../middlewares/register.middleware.js";

export const registerRoutes = (server) => {
  server.post("/api/auth/register", {
    preHandler: [validateRegistrationInput, checkIfEmailExists],
    handler: registerUser,
  });
};
