import { registerUser } from "../../controllers/register.controllers.js";
import { validateRegistrationInput, checkIfEmailExists } from "../../middlewares/register.middleware.js";

export const registerRoutes = (server) => {
  server.post("/api/register", {
    preHandler: [validateRegistrationInput, checkIfEmailExists],
    handler: registerUser,
  });
};
