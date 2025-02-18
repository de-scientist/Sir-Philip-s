import { 
    getUser, 
    updateUserProfile 
  } from "../controllers/users.controllers.js"; 
  import { authenticateUser } from "../middlewares/auth.js"; 
  
  export const userRoutes = (server) => {
    // Get User Profile - This route is protected by authenticateUser middleware
    server.get("/api/users/profile", { preHandler: [authenticateUser], handler: getUser });
  
    // Update User Profile - This route is protected by authenticateUser middleware
    server.put("/api/users/profile", { preHandler: [authenticateUser], handler: updateUserProfile });
  };
  