# Sir Philip's E-Commerce Platform Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Authentication Flow](#authentication-flow)
8. [Production Deployment](#production-deployment)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)
11. [Troubleshooting](#troubleshooting)

## Project Overview

Sir Philip's is a full-featured e-commerce platform that allows customers to browse products, add them to cart, place orders, and track deliveries. The application provides a comprehensive admin dashboard for managing products, orders, and user accounts.

### Key Features
- User authentication and account management
- Product catalog with categories and variants
- Shopping cart functionality
- Order placement and tracking
- Delivery management
- Payment processing (mpesa, credit, bank)
- Admin dashboard with sales analytics
- Product reviews and ratings

## Architecture

The platform follows a client-server architecture with a RESTful API backend:

- **Frontend**: React.js application
- **Backend**: Fastify.js server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies

### System Architecture Diagram
