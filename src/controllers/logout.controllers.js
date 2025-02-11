import { tokenBlacklist } from "../middlewares/logout.middleware.js";

export const logout = async (req, reply) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
      return reply.status(400).send({ error: "No active session found" });
    }

    // Add both tokens to the blacklist
    if (accessToken) tokenBlacklist.add(accessToken);
    if (refreshToken) tokenBlacklist.add(refreshToken);

    // Clear both cookies
    reply.clearCookie("access_token");
    reply.clearCookie("refresh_token");

    return reply.status(200).send({ message: "Logout successful" });
  } catch (error) {
    return reply.status(500).send({ error: error.message });
  }
};
