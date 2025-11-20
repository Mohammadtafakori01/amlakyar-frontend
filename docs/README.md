# API Documentation

This directory contains API documentation for frontend developers.

## Documentation Files

- [User Management API](./user-management.md) - Complete guide for user management endpoints including staff creation, user updates, and filtering

## Overview

These documents describe how the frontend should interact with backend APIs, including:
- Endpoint URLs and methods
- Request/response formats
- Authentication requirements
- Error handling
- Implementation tips

## Quick Reference

### User Management
- **Base URL:** `/api/users`
- **Authentication:** Required (JWT Bearer token)
- **Key Endpoints:**
  - `GET /api/users` - Get all users (with optional role filter)
  - `POST /api/users/staff` - Create staff member
  - `PATCH /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user (Master only)
  - `GET /api/users/me/profile` - Get current user profile

See [User Management API](./user-management.md) for complete details.

