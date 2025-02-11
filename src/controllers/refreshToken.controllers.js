export const refreshTokenController = async (req, reply) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return reply.status(401).send({ data: { message: "Unauthorized. No refresh token provided." } });
    }

    try {
     
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
        .send({ message: "Token refreshed successfully" });
    } catch (error) {
      return reply.status(403).send({ data: { message: "Invalid or expired refresh token. Please log in again." } });
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    reply.status(500).send({ data: { message: "An error occurred while refreshing token." } });
  }
};
