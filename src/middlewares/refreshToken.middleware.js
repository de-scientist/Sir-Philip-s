import { tokenBlacklist } from "./logout.middleware.js";

export const validateRefreshToken = async (req, reply) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return reply.status(401).send({ error: "Refresh token missing" });
    }

    if (tokenBlacklist.has(refreshToken)) {
      return reply
        .status(401)
        .send({ error: "Refresh token has been revoked" });
    }

    return true;
  } catch (error) {
    return reply.status(401).send({ error: "Invalid refresh token" });
  }
};
