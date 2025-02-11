export const refreshTokenController = async (req, reply) => {
    try {
      const refreshToken = req.cookies.refresh_token;
  
      if (!refreshToken) {
        return reply.status(401).send({ message: "Refresh token missing" });
      }
  
      const decoded = req.server.jwt.verify(refreshToken);
  
      const newAccessToken = req.server.jwt.sign(
        { id: decoded.id },
        { expiresIn: "15m" }
      );
  
      reply
        .setCookie("access_token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        })
        .status(200)
        .send({ message: "Token refreshed" });
    } catch (error) {
      logger.error("Refresh token error:", error);
      reply.status(403).send({ message: "Invalid or expired refresh token" });
    }
  };
  