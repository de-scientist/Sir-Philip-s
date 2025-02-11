import { tokenBlacklist } from "../middlewares/logout.middleware.js";

export const logout = async (req, reply) => {
  try {
    const accessToken = req.cookies.access_token;
    const refreshToken = req.cookies.refresh_token;

    if (!accessToken && !refreshToken) {
      return reply.status(400).send({ error: "No active session found" });
    }

    if (accessToken) tokenBlacklist.add(accessToken);
    if (refreshToken) tokenBlacklist.add(refreshToken);

    reply.clearCookie("access_token");
    reply.clearCookie("refresh_token");

    return reply.status(200).send({ message: "Logout successful" });
  } catch (error) {
    return reply.status(500).send({ message:"Something went wrong" });
  }
};
