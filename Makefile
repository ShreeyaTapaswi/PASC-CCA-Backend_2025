.PHONY: help build up down restart logs migrate shell db-shell backup clean

help: ## Show available commands
	@echo 'Available commands:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

setup: ## First time setup
	@if [ ! -f .env ]; then cp env.docker.example .env; echo "✅ .env created. Edit it with your values!"; exit 1; fi
	@docker-compose build
	@docker-compose up -d
	@echo "✅ Setup complete! API: http://localhost:3000"

build: ## Build Docker images
	docker-compose build

up: ## Start services
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "API: http://localhost:3000"
	@echo "Swagger: http://localhost:3000/api-docs"

down: ## Stop services
	docker-compose down

restart: ## Restart services
	docker-compose restart

logs: ## View logs
	docker-compose logs -f app

ps: ## Show running containers
	docker-compose ps

migrate: ## Run database migrations
	docker-compose exec app npx prisma migrate deploy

shell: ## Open app shell
	docker-compose exec app sh

db-shell: ## Open database shell
	docker-compose exec postgres psql -U pasc_user -d pasc_cca_2025

backup: ## Backup database
	@mkdir -p backups
	docker-compose exec postgres pg_dump -U pasc_user pasc_cca_2025 > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created in backups/"

clean: ## Remove containers and volumes
	docker-compose down -v

