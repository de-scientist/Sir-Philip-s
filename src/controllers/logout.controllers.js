import { invalidateToken } from '../middlewares/logout.middleware.js';

export const logoutController = async (req, reply) => {
  try {
    const { token, refreshToken } = req.cookies;
    
    // Invalidate both tokens
    if (token) invalidateToken(token);
    if (refreshToken) invalidateToken(refreshToken);

    // Clear both cookies
    reply.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    reply.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    return reply.send({
      success: true,
      message: "Logged out successfully, all sessions cleared"
    });
  } catch (error) {
    console.error('Logout error:', error);
    return reply.status(500).send({
      success: false,
      error: "Error during logout"
    });
  }
};
