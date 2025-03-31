import { logger } from "../utils/logger.js";

export const logoutController = async (request, reply) => {
  try {
    // Clear authentication token cookie
    reply.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    // Clear CSRF token cookie
    reply.clearCookie('csrfToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });
    
    logger.info('User logged out successfully');
    reply.send({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    reply.code(500).send({ message: 'Error during logout' });
  }
};
