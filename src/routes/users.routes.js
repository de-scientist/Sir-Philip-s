import { 
    registerUser, 
    loginUser, 
    getUser, 
    updateUserProfile 
  } from "../controllers/users.controller.js"; // Assuming your user controllers are in the 'users.controller.js' file
  import { authenticateUser } from "../middlewares/auth.js"; // Importing authentication middleware
  
  export const userRoutes = (server) => {
    // User Registration
    server.post("/api/users/register", { handler: registerUser });

  
    // User Login
    server.post("/api/users/login", { handler: loginUser });
  
    // Get User Profile - This route is protected by authenticateUser middleware
    server.get("/api/users/profile", { preHandler: [authenticateUser], handler: getUser });
  
    // Update User Profile - This route is protected by authenticateUser middleware
    server.put("/api/users/profile", { preHandler: [authenticateUser], handler: updateUserProfile });
  };
  