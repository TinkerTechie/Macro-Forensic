.PHONY: up down dev build logs clean lint check

up:
	docker compose up -d

down:
	docker compose down -v

dev:
	@echo "Starting development environment..."
	docker compose -f mfas/docker-compose.yml up -d
	@echo "Local DBs started. Run API and Frontend separately."

build:
	docker compose build

logs:
	docker compose logs -f

clean:
	docker compose down -v
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

lint:
	cd frontend && npm run lint
	cd mfas && ruff check .

check:
	detect-secrets scan .
