# User Management API Guide

This guide explains how the frontend should interact with the user management endpoints.

## Base URL

All endpoints are prefixed with `/api/users`

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints Overview

### 1. Get All Users

**GET** `/api/users?role=<UserRole>`

**Access:** Master, Admin

**Query Parameters:**

- `role` (optional): Filter users by role (MASTER, ADMIN, SUPERVISOR, SECRETARY, CONSULTANT, CUSTOMER)

**Behavior:**

- **Master users:** See all users across all estates

- **Admin users:** Only see users belonging to their estate

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users?role=CONSULTANT', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

**Response:**

```json
[
  {
    "id": "uuid",
    "phoneNumber": "09123456789",
    "firstName": "علی",
    "lastName": "احمدی",
    "nationalId": "1234567890",
    "role": "CONSULTANT",
    "isActive": true,
    "isApproved": true,
    "estateId": "estate-uuid",
    "parentId": "parent-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2. Get Single User

**GET** `/api/users/:id`

**Access:** Master, Admin

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users/a2b16074-2c23-48f7-9cf2-a120a640d887', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

**Response:** Same structure as user object in list response

---

### 3. Create Staff Member

**POST** `/api/users/staff`

**Access:** Master, Admin

**Request Body:**

```json
{
  "phoneNumber": "09123456789",
  "firstName": "محمد",
  "lastName": "رضایی",
  "nationalId": "1234567890",
  "role": "CONSULTANT",
  "password": "optional-password",
  "estateId": "optional-estate-uuid"
}
```

**Field Requirements:**

- `phoneNumber`: Required, 11 digits, must start with `09`

- `firstName`: Required, string

- `lastName`: Required, string

- `nationalId`: Required, exactly 10 digits

- `role`: Required, must be one of: SUPERVISOR, SECRETARY, CONSULTANT

- `password`: Optional, minimum 6 characters

- `estateId`: Optional, UUID string - The estate ID the new user should belong to. When Supervisor or Admin creates staff, they should include their own `estateId` to ensure the new user is properly linked to their estate.

**Hierarchy Rules:**

- **Supervisors** can only create **Consultants**

- **Secretaries** cannot create staff

- **Admins** can create Supervisors, Secretaries, and Consultants

- New staff automatically inherits the creator's `estateId` if not explicitly provided. However, it's recommended to explicitly send `estateId` when Supervisor/Admin creates staff members.

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users/staff', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    phoneNumber: '09123456789',
    firstName: 'محمد',
    lastName: 'رضایی',
    nationalId: '1234567890',
    role: 'CONSULTANT',
    password: 'password123',
    estateId: 'creator-estate-uuid' // Include estateId for Supervisor/Admin
  })
})
```

**Success Response (201):**

```json
{
  "id": "new-user-uuid",
  "phoneNumber": "09123456789",
  "firstName": "محمد",
  "lastName": "رضایی",
  "role": "CONSULTANT",
  "isActive": true,
  "isApproved": true,
  "estateId": "inherited-estate-uuid",
  "parentId": "creator-uuid"
}
```

**Error Responses:**

- `403 Forbidden`: User doesn't have permission to create staff

- `400 Bad Request`: Validation errors (invalid phone, nationalId format, etc.)

- `409 Conflict`: Phone number already exists

---

### 4. Update User

**PATCH** `/api/users/:id`

**Access:** Master, Admin

**Request Body (all fields optional):**

```json
{
  "firstName": "علی",
  "lastName": "احمدی",
  "phoneNumber": "09123456789",
  "nationalId": "1234567890",
  "password": "new-password",
  "role": "SUPERVISOR"
}
```

**Field Details:**

- `firstName`, `lastName`, `phoneNumber`, `nationalId`, `password`, `role`: Standard user fields that can be updated

**Note:** The following fields are NOT accepted in the update request:
- `isActive` - Cannot be updated via this endpoint
- `isApproved` - Cannot be updated via this endpoint  
- `estateId` - Cannot be updated via this endpoint

If you need to update these fields, please check with the backend team for separate endpoints or future implementation.

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users/a2b16074-2c23-48f7-9cf2-a120a640d887', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <token>'
  },
  body: JSON.stringify({
    firstName: 'علی',
    isActive: true,
    isApproved: true
  })
})
```

**Success Response (200):**

```json
{
  "id": "user-uuid",
  "firstName": "علی",
  "lastName": "احمدی",
  "isActive": true,
  "isApproved": true,
  ...
}
```

**Error Responses:**

- `400 Bad Request`: Validation errors

- `404 Not Found`: User not found

- `404 Not Found`: Estate not found (when updating estateId)

---

### 5. Delete User (Soft Delete)

**DELETE** `/api/users/:id`

**Access:** Master only

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users/a2b16074-2c23-48f7-9cf2-a120a640d887', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

**Note:** This is a soft delete - sets `isActive` to `false` instead of removing the record.

---

### 6. Get Current User Profile

**GET** `/api/users/me/profile`

**Access:** All authenticated users

**Example Request:**

```javascript
fetch('http://localhost:3002/api/users/me/profile', {
  headers: {
    'Authorization': 'Bearer <token>'
  }
})
```

**Response:** Same structure as user object

---

## User Roles Enum

```typescript
enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  SECRETARY = 'SECRETARY',
  CONSULTANT = 'CONSULTANT',
  CUSTOMER = 'CUSTOMER'
}
```

## Common Error Responses

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "statusCode": 403,
  "message": "Insufficient permissions"
}
```

### 400 Bad Request (Validation)

```json
{
  "statusCode": 400,
  "message": [
    "phoneNumber must be a valid Iranian phone number",
    "nationalId must be exactly 10 digits"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "User with ID xxx not found",
  "error": "Not Found"
}
```

### 409 Conflict

```json
{
  "statusCode": 409,
  "message": "User with this phone number already exists",
  "error": "Conflict"
}
```

## Frontend Implementation Tips

1. **User List Filtering:**
   - For Admin users, the backend automatically filters by `estateId`
   - You can add client-side filtering by role using the `?role=` query parameter

2. **Update User Form:**
   - Only send fields that have changed to minimize payload size
   - Show appropriate fields based on user role (e.g., only Masters can change `estateId`)

3. **Staff Creation:**
   - Validate phone number format (09xxxxxxxxx) before submission
   - Validate national ID format (10 digits) before submission
   - Show role restrictions based on current user's role

4. **Error Handling:**
   - Parse validation errors array and display field-specific messages
   - Handle 403 errors by redirecting unauthorized users
   - Show user-friendly messages for common errors

5. **State Management:**
   - Refresh user list after creating/updating/deleting users
   - Cache user profile data to reduce API calls

