# PASC CCA Backend 2025

A comprehensive backend system for managing CCA (Co-Curricular Activities) events, attendance, and student credits.

## 🚀 Quick Start (New System)

### Prerequisites
- Docker & Docker Compose installed
- That's it! No Node.js, PostgreSQL, or other dependencies needed locally.

### Setup in 2 Steps

```bash
# 1. Create environment file
cp env.docker.example .env
# Edit .env and set:
#   - JWT_SECRET (use a strong random string)
#   - POSTGRES_PASSWORD (database password)
#   - SMTP credentials (for email notifications)

# 2. Start everything
make up
```

**That's it!** `make up` automatically:
- ✅ Builds Docker images (first time only)
- ✅ Starts PostgreSQL database
- ✅ Runs all migrations
- ✅ Starts the backend API

**Time:** ~2-5 minutes first time, ~10 seconds after that.

### Access

- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Database**: localhost:5432

## 📋 Common Commands

```bash
make help      # Show all available commands
make up        # Start services
make down      # Stop services
make logs      # View application logs
make restart   # Restart services
make ps        # Show container status
make migrate   # Run database migrations
make shell     # Open app container shell
make db-shell  # Open database shell
make backup    # Backup database
make clean     # Remove containers and data
```

## 🎯 Features

### Core Features
- ✅ User & Admin authentication (JWT)
- ✅ Event management (CRUD)
- ✅ RSVP system with capacity & waitlist
- ✅ Multi-session attendance tracking
- ✅ Automatic credit calculation

### New Features (2025)
1. **Email Notifications** - Automated emails for events, RSVPs, attendance
2. **Event Reviews** - Rating and feedback system
3. **Event Resources** - Upload slides, videos, documents
4. **Event Gallery** - Photo gallery for events
5. **Calendar Integration** - iCal, Google Calendar, Outlook links
6. **Analytics Dashboard** - Event statistics and insights
7. **Leaderboard** - Student rankings by credits and attendance
8. **Announcements** - Targeted announcements by department/year
9. **Waitlist Management** - Automatic promotion when spots open
10. **Enhanced Sessions** - Multiple sessions per event with individual credits

## 🗂️ API Documentation

Once running, visit http://localhost:3000/api-docs for complete API documentation with Swagger UI.

### Main Endpoints

- `/api/auth/*` - Authentication (login, register)
- `/api/events/*` - Event management
- `/api/rsvp/*` - RSVP operations
- `/api/attendance/*` - Attendance tracking
- `/api/reviews/*` - Event reviews
- `/api/resources/*` - Event resources
- `/api/gallery/*` - Event gallery
- `/api/announcements/*` - Announcements
- `/api/leaderboard/*` - Leaderboards
- `/api/analytics/*` - Analytics
- `/api/calendar/*` - Calendar integration

## 🛠️ Troubleshooting

### Container won't start?
```bash
make logs    # Check logs for errors
make down    # Stop everything
make up      # Start fresh
```

### Database issues?
```bash
make db-shell                    # Connect to database
\dt                              # List all tables
\d "Event"                       # Describe Event table
```

### Need to reset everything?
```bash
make clean   # Removes all containers and data
make up      # Start fresh
```

## 📁 Project Structure

```
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth, validation, etc.
│   ├── types/            # TypeScript types
│   └── lib/              # Utilities (Prisma client, etc.)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── docker-compose.yml    # Docker services config
├── Dockerfile            # App container config
├── Makefile              # Convenient commands
└── .env                  # Your configuration (create from .env.example)
```

## 🔒 Security Notes

- Never commit `.env` file
- Use strong JWT_SECRET (32+ characters)
- Use strong POSTGRES_PASSWORD
- Keep SMTP credentials secure
- In production, use proper SSL/TLS

## 🐛 Development

To modify code:
1. Edit files locally
2. Rebuild: `make down && make up --build`
3. Check logs: `make logs`

## 📊 Database Schema

The system includes these main models:
- User, Admin
- Event, AttendanceSession
- Rsvp, Attendance
- EventReview, EventResource, EventGallery
- Notification, Announcement
- Leaderboard, Analytics
- Tokens (User, Admin)

## 🤝 Contributing

1. Make changes
2. Test locally with `make up`
3. Ensure `npm run build` passes
4. Submit PR

## 📝 License

MIT License

---

**Need help?** Check `DOCKER.md` for more Docker-specific information.

