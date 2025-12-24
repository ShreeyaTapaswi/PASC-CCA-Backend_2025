# ✅ Setup Checklist for New System

## Prerequisites
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)

## Setup (2 Steps)

### Step 1: Configure Environment
```bash
cp env.docker.example .env
# Edit .env and set:
# - JWT_SECRET (generate: openssl rand -base64 32)
# - POSTGRES_PASSWORD (any strong password)
# - SMTP_USER and SMTP_PASS (optional, for emails)
```

### Step 2: Start Everything
```bash
make up
```

**Done!** Wait 30-60 seconds, then verify:

```bash
# Check status
make ps
# Both containers should show "Up (healthy)"

# Test API
curl http://localhost:3000/api/events
# Should return JSON with success:true

# Open Swagger docs
open http://localhost:3000/api-docs
```

## Common Issues & Solutions

### Issue: "Port 3000 already in use"
```bash
# Find what's using port 3000
lsof -i :3000

# Kill it or change APP_PORT in .env
echo "APP_PORT=3001" >> .env
make down && make up
```

### Issue: "Port 5432 already in use"
```bash
# Stop local PostgreSQL
brew services stop postgresql
# Or change POSTGRES_PORT in .env
```

### Issue: "Container keeps restarting"
```bash
# Check logs
make logs

# Common fixes:
# 1. Check .env file has all required values
# 2. Ensure no syntax errors in .env
# 3. Try clean start:
make down
make clean
make up
```

### Issue: "Database connection failed"
```bash
# Wait longer (database takes ~10 seconds to start)
sleep 15
make ps

# If still failing, check logs
make logs
```

## What Happens on First Run?

1. **Docker builds the image** (~2-5 minutes first time)
   - Installs Node.js dependencies
   - Compiles TypeScript
   - Generates Prisma Client

2. **Database starts** (~10 seconds)
   - PostgreSQL container starts
   - Creates database

3. **Migrations run automatically** (~5 seconds)
   - Creates all 17 tables
   - Sets up relationships

4. **Backend starts** (~5 seconds)
   - Connects to database
   - Starts API server
   - Ready to accept requests

## Subsequent Runs

After first setup, starting is instant:
```bash
make up    # ~10 seconds total
```

## Files You Need

✅ Already included:
- `Dockerfile` - App container config
- `docker-compose.yml` - Services config
- `Makefile` - Easy commands
- `env.docker.example` - Environment template
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/*` - All migrations

❌ You need to create:
- `.env` - Your configuration (copy from env.docker.example)

## Testing the Setup

### 1. Create Admin
```bash
curl -X POST http://localhost:3000/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@pasc.com",
    "password": "admin123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pasc.com",
    "password": "admin123"
  }'
```

### 3. Create Event (use token from login)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Test Event",
    "description": "Testing the system",
    "location": "Room 101",
    "credits": 2,
    "numDays": 1,
    "capacity": 50,
    "startDate": "2025-01-15T10:00:00Z",
    "endDate": "2025-01-15T12:00:00Z"
  }'
```

## Success Indicators

✅ **Everything is working if:**
- `make ps` shows both containers as "Up (healthy)"
- `curl http://localhost:3000/api/events` returns JSON
- Swagger docs load at http://localhost:3000/api-docs
- You can create admin and login
- Logs show no errors: `make logs`

## Need Help?

1. Check `README.md` for detailed documentation
2. Check `DOCKER.md` for Docker-specific info
3. Run `make logs` to see what's happening
4. Run `make help` to see all commands

---

**Estimated Total Setup Time: 5-10 minutes** (including Docker image build)
**Subsequent Starts: ~10 seconds**

