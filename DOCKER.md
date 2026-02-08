# 🐳 Docker Setup

## Quick Start

```bash
# 1. Create .env file
cp env.docker.example .env
# Edit .env with your JWT_SECRET, POSTGRES_PASSWORD, and SMTP credentials

# 2. Run everything
make setup

# That's it! 🚀
```

## Common Commands

```bash
make help      # Show all commands
make up        # Start
make down      # Stop
make logs      # View logs
make restart   # Restart
make migrate   # Run migrations
make shell     # App shell
make db-shell  # Database shell
make backup    # Backup database
```

## Access

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- PgAdmin: http://localhost:5050

## What's Running?

- **PostgreSQL** - Database on port 5432
- **Backend API** - Node.js app on port 3000
- **PgAdmin** - Database UI on port 5050 (optional)

## Files

- `Dockerfile` - App container config
- `docker-compose.yml` - Services configuration
- `Makefile` - Easy commands
- `.env` - Your configuration (don't commit!)

That's all you need! 🎉

