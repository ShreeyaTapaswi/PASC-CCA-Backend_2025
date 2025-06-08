# PASC CCA 2025 Backend

A Node.js backend application with TypeScript, Express, and Prisma ORM for managing college events and attendance.

## Features

- User and Admin Authentication
- Event Management
- RSVP System
- Attendance Tracking
- Credit Hours Management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd PASC_CCA_2025
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## API Documentation

### Swagger UI
The API documentation is available through Swagger UI. Once the server is running, you can access it at:
```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:
- View all available endpoints
- Test API endpoints directly from the browser
- See request/response schemas
- Understand authentication requirements

### Authentication Endpoints

#### User Authentication

##### Register User
```http
POST /api/auth/user/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "department": "IT",
  "year": 3,
  "passoutYear": 2025,
  "roll": 12345
}
```

##### Login User
```http
POST /api/auth/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

##### Get Current User
```http
GET /api/auth/user/me
Authorization: Bearer <token>
```

##### Logout User
```http
POST /api/auth/user/logout
Authorization: Bearer <token>
```

#### Admin Authentication

##### Register Admin
```http
POST /api/auth/admin/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}
```

##### Login Admin
```http
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

##### Get Current Admin
```http
GET /api/auth/admin/me
Authorization: Bearer <token>
```

##### Logout Admin
```http
POST /api/auth/admin/logout
Authorization: Bearer <token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Database Schema

### User
- id: Int (Primary Key, Auto-increment)
- email: String (Unique)
- password: String
- name: String (Optional)
- department: Department (Enum)
- year: Int
- passoutYear: Int
- roll: Int
- hours: Float
- createdAt: DateTime
- updatedAt: DateTime
- tokens: UserToken[] (Relation)
- rsvps: Rsvp[] (Relation)
- attendances: Attendance[] (Relation)

### Admin
- id: Int (Primary Key, Auto-increment)
- email: String (Unique)
- password: String
- name: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
- tokens: AdminToken[] (Relation)

### Event
- id: Int (Primary Key, Auto-increment)
- title: String
- description: String
- location: String
- credits: Float
- numDays: Int
- status: EventStatus (Enum)
- startDate: DateTime
- endDate: DateTime
- createdAt: DateTime
- updatedAt: DateTime
- rsvps: Rsvp[] (Relation)
- sessions: AttendanceSession[] (Relation)

### Rsvp
- id: Int (Primary Key, Auto-increment)
- user: User (Relation)
- userId: Int (Foreign Key)
- event: Event (Relation)
- eventId: Int (Foreign Key)
- createdAt: DateTime
- @@unique([userId, eventId])

### AttendanceSession
- id: Int (Primary Key, Auto-increment)
- event: Event (Relation)
- eventId: Int (Foreign Key)
- startTime: DateTime
- endTime: DateTime (Optional)
- code: String
- attendances: Attendance[] (Relation)

### Attendance
- id: Int (Primary Key, Auto-increment)
- user: User (Relation)
- userId: Int (Foreign Key)
- session: AttendanceSession (Relation)
- sessionId: Int (Foreign Key)
- attendedAt: DateTime
- @@unique([userId, sessionId])

### UserToken
- id: Int (Primary Key, Auto-increment)
- token: String (Unique)
- user: User (Relation)
- userId: Int (Foreign Key)
- createdAt: DateTime

### AdminToken
- id: Int (Primary Key, Auto-increment)
- token: String (Unique)
- admin: Admin (Relation)
- adminId: Int (Foreign Key)
- createdAt: DateTime

### Enums

#### Department
- CE
- IT
- ENTC
- ECE
- AIDS

#### EventStatus
- UPCOMING
- ONGOING
- COMPLETED

### Relationships
- User 1:N UserToken (One user can have multiple tokens)
- User 1:N Rsvp (One user can have multiple RSVPs)
- User 1:N Attendance (One user can have multiple attendances)
- Admin 1:N AdminToken (One admin can have multiple tokens)
- Event 1:N Rsvp (One event can have multiple RSVPs)
- Event 1:N AttendanceSession (One event can have multiple attendance sessions)
- AttendanceSession 1:N Attendance (One session can have multiple attendances)

## Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build the TypeScript code
- `npm start`: Start the production server
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:migrate`: Run database migrations

### Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middlewares/    # Custom middlewares
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Error Handling

The API uses a centralized error handling system. All errors are caught and formatted consistently:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- All sensitive routes require authentication
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
