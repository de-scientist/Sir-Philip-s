export const tokenBlacklist = new Set();

export const checkTokenBlacklist = async (req, reply) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  if (!accessToken && !refreshToken) {
    return reply.status(400).send({ message: "Token is missing" });
  }

  if (tokenBlacklist.has(token)) {
    return reply.status(401).send({ message: "Token has been revoked" });
  }
};
