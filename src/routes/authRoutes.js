import {
  loginController,
  refreshTokenController,
  logoutController,
} from "../controllers/auth.js";

app.post("/auth/login", loginController);
app.post("/auth/refresh", refreshTokenController);
app.post("/auth/logout", logoutController);
