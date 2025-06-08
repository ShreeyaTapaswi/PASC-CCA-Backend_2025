# PASC CCA Backend 2025

Backend API for PICT ACM Student Chapter's CCA (Co-Curricular Activities) Management System.

## Features

- 🔐 Authentication (User & Admin)
- 📝 Event Management
- ✅ RSVP System
- 📊 Attendance Tracking
- 📚 Swagger API Documentation

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma (PostgreSQL)
- JWT Authentication
- Swagger UI

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/PICT-ACM-Student-Chapter/PASC-CCA-Backend_2025.git
cd PASC-CCA-Backend_2025
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pasc_cca_2025"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Set up the database:
```bash
# Create database
createdb pasc_cca_2025

# Run migrations
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## API Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:3000/api-docs

## Database Schema

### User
```prisma
model User {
  id            Int      @id @default(autoincrement())
  name          String
  email         String   @unique
  password      String
  department    Department
  year          Int
  passoutYear   Int
  rollNumber    String   @unique
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  tokens        UserToken[]
  rsvps         Rsvp[]
  attendances   Attendance[]
}
```

### Admin
```prisma
model Admin {
  id            Int      @id @default(autoincrement())
  name          String
  email         String   @unique
  password      String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  tokens        AdminToken[]
  events        Event[]
  sessions      AttendanceSession[]
}
```

### Event
```prisma
model Event {
  id            Int      @id @default(autoincrement())
  title         String
  description   String
  date          DateTime
  location      String
  capacity      Int
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  admin         Admin    @relation(fields: [adminId], references: [id])
  adminId       Int
  rsvps         Rsvp[]
  sessions      AttendanceSession[]
}
```

### RSVP
```prisma
model Rsvp {
  id            Int      @id @default(autoincrement())
  status        RsvpStatus
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  userId        Int
  event         Event    @relation(fields: [eventId], references: [id])
  eventId       Int
}
```

### Attendance Session
```prisma
model AttendanceSession {
  id            Int      @id @default(autoincrement())
  startTime     DateTime
  endTime       DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  admin         Admin    @relation(fields: [adminId], references: [id])
  adminId       Int
  event         Event    @relation(fields: [eventId], references: [id])
  eventId       Int
  attendances   Attendance[]
}
```

### Attendance
```prisma
model Attendance {
  id            Int      @id @default(autoincrement())
  checkInTime   DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId], references: [id])
  userId        Int
  session       AttendanceSession @relation(fields: [sessionId], references: [id])
  sessionId     Int
}
```

## API Endpoints

### Authentication
- `POST /api/auth/user/register` - Register a new user
- `POST /api/auth/user/login` - User login
- `POST /api/auth/admin/register` - Register a new admin
- `POST /api/auth/admin/login` - Admin login

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### RSVPs
- `POST /api/events/:id/rsvp` - RSVP to an event
- `GET /api/events/:id/rsvps` - Get RSVPs for an event

### Attendance
- `POST /api/events/:id/sessions` - Create attendance session (Admin only)
- `POST /api/sessions/:id/attendance` - Mark attendance
- `GET /api/sessions/:id/attendance` - Get attendance for a session

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Maintenance tasks




