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
