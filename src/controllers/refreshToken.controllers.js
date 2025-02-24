export const refreshTokenController = async (req, reply) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Verify the refresh token
    const decoded = await req.server.jwt.verify(refreshToken);

    // Generate new tokens
    const accessToken = await reply.jwtSign(
      { id: decoded.id, email: decoded.email },
      { expiresIn: "60m" },
    );

    const newRefreshToken = await reply.jwtSign(
      { id: decoded.id, email: decoded.email },
      { expiresIn: "28d" },
    );

    // Set cookies
    reply.setCookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    reply.setCookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    return reply.send({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return reply.status(401).send({
      success: false,
      error: "Invalid refresh token",
    });
  }
};
