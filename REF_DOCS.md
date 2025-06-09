# PASC CCA 2025 API Documentation

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

### Authentication

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

## Error Responses

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
