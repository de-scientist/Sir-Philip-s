import { logoutController } from '../../controllers/logout.controllers.js';
import { validateToken } from '../../middlewares/logout.middleware.js';

export const logoutRoutes = (server) => {
  server.post('/api/auth/logout', {
    preHandler: [validateToken],
    handler: logoutController
  });
};
