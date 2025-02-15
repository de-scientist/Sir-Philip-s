# E-Commerce API Documentation

## Overview
This is a RESTful API for an e-commerce platform built with Fastify, Prisma, and PostgreSQL. The API provides functionality for user authentication, product management, shopping cart operations, order processing, and more.

## Authentication
All authenticated endpoints require a valid JWT token in the HTTP-only cookie.

### Authentication Endpoints

#### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:** Returns user details and sets authentication cookies

#### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "firstname": "string",
    "lastname": "string",
    "email": "string",
    "password": "string",
    "phoneNo": "string"
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- Invalidates the current session

## Products API

### Endpoints

#### Create Product
- **POST** `/api/categories/:categoryId/product`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "currentPrice": "number",
    "previousPrice": "number",
    "stock": "number",
    "images": "string[]"
  }
  ```

#### Get Products
- **GET** `/api/products`
- **Auth Required:** No
- Returns list of all products

#### Get Product by ID
- **GET** `/api/products/:id`
- **Auth Required:** No
- Returns specific product details

#### Update Product
- **PUT** `/api/products/:id`
- **Auth Required:** Yes
- Updates product information

#### Delete Product
- **DELETE** `/api/products/:id`
- **Auth Required:** Yes

#### Filter Products
- **GET** `/api/products/filter`
- **Auth Required:** No
- Supports filtering by various parameters

#### Search Products
- **GET** `/api/products/search`
- **Auth Required:** No
- Supports text search in product names and descriptions

## Cart API

### Endpoints

#### Create Cart
- **POST** `/api/cart`
- **Auth Required:** Yes

#### Get Cart
- **GET** `/api/cart`
- **Auth Required:** Yes
- Returns user's cart contents

#### Update Cart
- **PUT** `/api/cart`
- **Auth Required:** Yes

#### Delete Cart
- **DELETE** `/api/cart`
- **Auth Required:** Yes

#### Add Product to Cart
- **POST** `/api/cart/add`
- **Auth Required:** Yes

#### Remove Product from Cart
- **POST** `/api/cart/delete`
- **Auth Required:** Yes

#### Modify Product Quantity
- **POST** `/api/cart/add-quantity/:id`
- **POST** `/api/cart/delete-quantity/:id`
- **Auth Required:** Yes

## Database Schema

The system uses PostgreSQL with Prisma as the ORM. Key models include:

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

## Security Features

1. JWT Authentication
2. HTTP-only cookies
3. Rate limiting
4. CORS protection
5. Input validation using Zod
6. Password hashing using bcrypt
7. Role-based access control

## Error Handling

The API implements comprehensive error handling with:
- Input validation errors
- Authentication errors
- Authorization errors
- Database errors
- Custom error messages
- Error logging using Winston

## Environment Configuration

Required environment variables:
- DATABASE_URL
- JWT_SECRET
- COOKIE_SECRET
- PORT
- NODE_ENV

## Rate Limiting

The API implements rate limiting with:
- 100 requests per minute per IP
- Customizable timeouts
- Protection against brute force attacks

## Logging

Winston logger is configured for:
- Error logging
- Access logging
- Authentication events
- System events

Logs are stored in:
- error.log (for errors)
- combined.log (for all logs)
- Console output in development
