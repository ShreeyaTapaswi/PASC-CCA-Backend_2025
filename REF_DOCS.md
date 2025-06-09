# PASC CCA 2025 API Documentation

## Table of Contents
1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Events](#events)
   - [RSVPs](#rsvps)
   - [Credits](#credits)
   - [Admin Dashboard](#admin-dashboard)
   - [Attendance](#attendance)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)
7. [Example Usage](#example-usage)

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints except `/auth/login` and `/auth/register` require authentication using a JWT token.

### Authentication Headers
```
Authorization: Bearer <your_jwt_token>
```

### Token Format
The JWT token contains the following payload:
```json
{
  "userId": "string",
  "role": "string" // "admin" or "user"
}
```

## API Endpoints

### Authentication Endpoints

#### 1. Register New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "user"
    }
  }
}
```

#### 2. Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "role": "string"
    }
  }
}
```

#### 3. Logout
```http
POST /auth/logout
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### 4. Get Current User
```http
GET /auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Events

#### 1. Create Event (Admin Only)
```http
POST /events
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "date": "string (ISO date)",
  "location": "string",
  "capacity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "capacity": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 2. Get All Events
```http
GET /events
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term for event title/description
- `date` (optional): Filter by date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "string",
        "title": "string",
        "description": "string",
        "date": "string",
        "location": "string",
        "capacity": "number",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
}
```

#### 3. Get Event by ID
```http
GET /events/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "capacity": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 4. Update Event (Admin Only)
```http
PUT /events/:id
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "date": "string (ISO date)",
  "location": "string",
  "capacity": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "description": "string",
    "date": "string",
    "location": "string",
    "capacity": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 5. Delete Event (Admin Only)
```http
DELETE /events/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Event deleted successfully"
  }
}
```

#### 6. Get Events by Admin (Admin Only)
```http
GET /events/admin
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "date": "string",
      "location": "string",
      "capacity": "number",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### RSVPs

#### 1. Create RSVP
```http
POST /rsvps
```

**Request Body:**
```json
{
  "eventId": "string",
  "status": "string" // "attending" or "not_attending"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 2. Get User's RSVPs
```http
GET /rsvps/user
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "eventId": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "event": {
        "id": "string",
        "title": "string",
        "description": "string",
        "date": "string",
        "location": "string",
        "capacity": "number"
      }
    }
  ]
}
```

#### 3. Get Event RSVPs (Admin Only)
```http
GET /rsvps/event/:eventId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "eventId": "string",
      "status": "string",
      "createdAt": "string",
      "updatedAt": "string",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string"
      }
    }
  ]
}
```

#### 4. Update RSVP
```http
PUT /rsvps/:id
```

**Request Body:**
```json
{
  "status": "string" // "attending" or "not_attending"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

#### 5. Delete RSVP
```http
DELETE /rsvps/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "RSVP deleted successfully"
  }
}
```

#### 6. Get RSVP for Event (User)
```http
GET /events/:eventId/rsvp
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### Credits

#### 1. Award Credits (Admin Only)
```http
POST /users/:userId/events/:eventId/credits
```

**Request Body:**
```json
{
  "credits": "number"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "eventId": "string",
    "credits": "number",
    "createdAt": "string"
  }
}
```

#### 2. Get Department Credit Statistics (Admin Only)
```http
GET /departments/:department/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "department": "string",
    "totalCredits": "number",
    "averageCredits": "number",
    "userCount": "number",
    "eventCount": "number"
  }
}
```

#### 3. Get Year-wise Credit Statistics (Admin Only)
```http
GET /years/:year/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "year": "string",
    "totalCredits": "number",
    "averageCredits": "number",
    "userCount": "number",
    "eventCount": "number",
    "monthlyStats": [
      {
        "month": "string",
        "credits": "number",
        "eventCount": "number"
      }
    ]
  }
}
```

#### 4. Get User Credits
```http
GET /users/:userId/credits
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "string",
    "totalCredits": "number",
    "currentLevel": "string",
    "history": [
      {
        "id": "string",
        "eventId": "string",
        "credits": "number",
        "createdAt": "string",
        "event": {
          "title": "string",
          "date": "string"
        }
      }
    ]
  }
}
```

### Admin Dashboard

#### 1. Get Dashboard Statistics (Admin Only)
```http
GET /admin/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": "number",
    "totalEvents": "number",
    "totalCredits": "number",
    "activeEvents": "number",
    "recentActivity": [
      {
        "type": "string",
        "description": "string",
        "timestamp": "string"
      }
    ]
  }
}
```

#### 2. Get User Management Details (Admin Only)
```http
GET /admin/users/:userId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "department": "string"
    },
    "stats": {
      "totalCredits": "number",
      "eventsAttended": "number",
      "rsvps": "number"
    }
  }
}
```

### Attendance

#### 1. Create Attendance Session (Admin Only)
```http
POST /events/:eventId/sessions
```

**Request Body:**
```json
{
  "startTime": "string (ISO date)",
  "endTime": "string (ISO date)",
  "location": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "eventId": "string",
    "qrCode": "string",
    "startTime": "string",
    "endTime": "string",
    "location": "string",
    "createdAt": "string"
  }
}
```

#### 2. Get Session Statistics (Admin Only)
```http
GET /sessions/:sessionId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "totalAttendees": "number",
    "attendanceRate": "number",
    "attendanceList": [
      {
        "userId": "string",
        "name": "string",
        "checkInTime": "string"
      }
    ]
  }
}
```

#### 3. Get Event Attendance List (Admin Only)
```http
GET /events/:eventId/attendance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventId": "string",
    "totalSessions": "number",
    "totalAttendees": "number",
    "sessions": [
      {
        "sessionId": "string",
        "startTime": "string",
        "endTime": "string",
        "attendees": "number"
      }
    ]
  }
}
```

#### 4. Refresh Session QR Code (Admin Only)
```http
POST /sessions/:sessionId/refresh-qr
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "string",
    "qrCode": "string",
    "updatedAt": "string"
  }
}
```

#### 5. Mark Attendance (User)
```http
POST /events/:eventId/sessions/:sessionId/attend
```

**Request Body:**
```json
{
  "qrCode": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "sessionId": "string",
    "checkInTime": "string"
  }
}
```

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "message": "string",
    "code": "string"
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `INTERNAL_ERROR`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse. The current limits are:
- 100 requests per 15 minutes for authenticated users
- 20 requests per 15 minutes for unauthenticated users

## Best Practices

1. Always include the `Authorization` header for protected endpoints
2. Handle rate limiting by implementing exponential backoff
3. Validate request data before sending
4. Handle all possible error responses
5. Use HTTPS in production
6. Store tokens securely and never expose them in client-side code

## Example Usage

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Create an event (admin only)
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Annual Meeting","description":"Yearly gathering","date":"2024-12-31T18:00:00Z","location":"Main Hall","capacity":100}'

# Get all events
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer <your_token>"
```

### Using JavaScript/TypeScript

```typescript
// Example using fetch
const API_URL = 'http://localhost:3000/api';

async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  return data;
}

async function getEvents(token: string) {
  const response = await fetch(`${API_URL}/events`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  return data;
}
``` 
