# PASC CCA 2025 API Documentation

// ... existing code ...

### Events

// ... existing code ...

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

// ... existing code ...

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

// ... rest of existing code ...
