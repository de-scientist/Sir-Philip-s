# Sir Philip's E-Commerce Platform

Sir Philip's is a robust, full-featured e-commerce solution built with modern web technologies. The platform offers a comprehensive shopping experience for customers and powerful management tools for administrators.

## 📋 Overview

Sir Philip's provides a complete solution for online retail, featuring product management, shopping cart functionality, order processing, delivery tracking, and payment integration. The application is built with a React frontend and a Fastify backend, using PostgreSQL as the database with Prisma ORM.

## ✨ Key Features

### For Customers
- **User Authentication** - Secure login and registration system with JWT-based authentication
- **Product Browsing** - Browse products by category with filtering and search capabilities
- **Shopping Cart** - Add items to cart, modify quantities, and proceed to checkout
- **Order Management** - Place orders and track their status
- **Payment Processing** - Multiple payment options (mpesa, credit, bank)
- **Delivery Tracking** - Monitor the status and location of orders
- **Product Reviews** - Rate and review purchased products

### For Administrators
- **Dashboard** - Comprehensive analytics and metrics
- **Inventory Management** - Add, edit, and remove products
- **Order Processing** - View, update, and manage customer orders
- **Delivery Management** - Coordinate and track product deliveries
- **Category Management** - Organize products into categories
- **User Management** - Manage customer accounts and permissions

## 🛠️ Technical Architecture

Sir Philip's follows a client-server architecture with:

- **Frontend**: React.js application
- **Backend**: Fastify.js RESTful API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT stored in HTTP-only cookies
- **Validation**: Zod for runtime type checking
- **Logging**: Winston logger for comprehensive logging

## 🧩 Component Breakdown

### Backend Components
- **Controllers** - Handle API requests and business logic
- **Middlewares** - Authenticate requests and validate inputs
- **Routes** - Define API endpoints
- **Services** - Implement core business functionality
- **Utils** - Provide helper functions and utilities

### Database Models
- User
- Product
- Category
- Order
- OrderItem
- Review
- Cart
- CartItem
- Variant
- Payment
- Delivery

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/Sir-Philip-s.git
cd Sir-Philip-s
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with:

# Sir-Philip-s

Project Update - Authentication & Environment Configuration
Overview
This update enhances authentication, environment variable management, and logging while improving code structure and security.

Key Changes
🔹 Environment Configuration
Introduced env.js to centralize environment variable management.
Updated .env file with database, authentication, and security configurations.
🔹 Authentication Improvements
Modified login.controllers.js and logout.controllers.js to enhance session handling.
Added refreshTokenController.js to manage token refresh functionality.
Updated auth.js middleware for better authentication and authorization logic.
🔹 Logging & Middleware
Improved logging in logging.middleware.js for better debugging.
Applied authentication middleware updates to secure routes.
🔹 Routes Organization
Introduced authRoutes.js to consolidate authentication-related routes.

Enhanced getProducts Function

Overview

This update improves the getProducts function by adding pagination, sorting, and filtering capabilities to make the API more flexible and efficient.

Key Features

✅ Pagination

Allows fetching products in pages with a defined limit.

Parameters:

page (default: 1): Specifies which page to retrieve.

limit (default: 10): Number of products per page.

✅ Sorting

Enables sorting results by various fields.

Parameters:

sortBy (default: name): Sort products by name, currentPrice, or createdAt.

order (default: asc): Sorting order (asc for ascending, desc for descending).

✅ Filtering

Supports filtering products based on price range.

Parameters:

minPrice: Fetch products with a currentPrice greater than or equal to this value.

maxPrice: Fetch products with a currentPrice less than or equal to this value.

Usage Examples

Fetch paginated results:

GET /products?page=2&limit=5

Sort by price in descending order:

GET /products?sortBy=currentPrice&order=desc

Filter by price range (100 - 500):

GET /products?minPrice=100&maxPrice=500

Error Handling

Returns 400 Bad Request for invalid pagination parameters.

Returns 500 Internal Server Error for unexpected failures.

Logging

Logs messages using logger.info() and logger.error() for better debugging.

Future Improvements

Add category-based filtering.

Implement search functionality.

## 🚀 Production Deployment

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v14+)
- Docker and Docker Compose (optional)
- Nginx (for production hosting)
- PM2 or similar process manager (for Node.js application)

### Environment Setup

Copy the example environment file and update with your actual values:

```bash
cp .env.example .env
# Edit .env with your production values
```

Required environment variables:
