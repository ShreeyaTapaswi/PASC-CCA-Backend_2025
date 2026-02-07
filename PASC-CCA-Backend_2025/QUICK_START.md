# 🚀 Quick Start - New System

## What You Need
- Docker & Docker Compose installed

## Setup (2 Commands)

```bash
# 1. Create config
cp env.docker.example .env
# Edit .env: Set JWT_SECRET, POSTGRES_PASSWORD, SMTP credentials

# 2. Start
make up
```

**That's it!** Everything happens automatically:
- Builds Docker images
- Starts database
- Runs migrations
- Starts backend

## Access
- API: http://localhost:3000
- Docs: http://localhost:3000/api-docs

## Verify
```bash
make ps          # Check status
make logs        # View logs
```

## Next Time
Just run:
```bash
make up          # Starts in ~10 seconds
```

## Stop
```bash
make down        # Stop everything
```

---

**See `README.md` for full documentation**
