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
- id: String (UUID, Primary Key)
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

### Admin
- id: String (UUID, Primary Key)
- email: String (Unique)
- password: String
- name: String (Optional)
- createdAt: DateTime
- updatedAt: DateTime
- tokens: AdminToken[] (Relation)

### UserToken
- id: String (UUID, Primary Key)
- token: String
- userId: String (Foreign Key to User)
- createdAt: DateTime
- expiresAt: DateTime
- user: User (Relation)

### AdminToken
- id: String (UUID, Primary Key)
- token: String
- adminId: String (Foreign Key to Admin)
- createdAt: DateTime
- expiresAt: DateTime
- admin: Admin (Relation)

### Department Enum
- CE
- IT
- ENTC
- ECE
- AIDS

### Relationships
- User 1:N UserToken (One user can have multiple tokens)
- Admin 1:N AdminToken (One admin can have multiple tokens)

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
