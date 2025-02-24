export const tokenBlacklist = new Set();

export const validateToken = async (req, reply) => {
  try {
    const { token, refreshToken } = req.cookies;

    if (!token && !refreshToken) {
      return reply.status(401).send({ error: "No active session found" });
    }

    // Check if either token is blacklisted
    if (
      (token && tokenBlacklist.has(token)) ||
      (refreshToken && tokenBlacklist.has(refreshToken))
    ) {
      return reply.status(401).send({ error: "Session already invalidated" });
    }

    return true;
  } catch (error) {
    return reply.status(401).send({ error: "Authentication failed" });
  }
};

export const invalidateToken = (token) => {
  tokenBlacklist.add(token);
  return true;
};
