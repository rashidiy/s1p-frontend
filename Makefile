DC = docker compose --profile dev

.PHONY: help dev up down rebuild logs test test-v test-watch test-cov shell ps clean

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

# ── Lifecycle ────────────────────────────────────────────────────────────────

dev: ## Build image and start dev container (hot reload on :3000)
	$(DC) up --build -d
	@echo "Started. Run 'make logs' to follow output."

up: ## Start without rebuilding
	$(DC) up -d

down: ## Stop and remove the dev container
	$(DC) down

rebuild: ## Full rebuild (clears .next cache, reinstalls deps)
	$(DC) down
	$(DC) up --build -d
	@echo "Rebuilt. Run 'make logs' to follow output."

# ── Logs ─────────────────────────────────────────────────────────────────────

logs: ## Follow dev container logs (Ctrl-C to stop)
	$(DC) logs -f nextjs-dev

# ── Tests (all run inside the container) ─────────────────────────────────────

test: ## Run all tests once
	$(DC) exec nextjs-dev npm run test

test-v: ## Run all tests with verbose output (use after adding a feature)
	$(DC) exec nextjs-dev npm run test -- --reporter=verbose

test-watch: ## Run tests in watch mode (re-runs on file save)
	$(DC) exec nextjs-dev npm run test:watch

test-cov: ## Run tests with coverage report
	$(DC) exec nextjs-dev npm run test:coverage

# ── Utils ─────────────────────────────────────────────────────────────────────

shell: ## Open a shell inside the dev container
	$(DC) exec nextjs-dev sh

ps: ## Show container status
	$(DC) ps

clean: ## Remove container, volumes, and node_modules cache (full reset)
	$(DC) down -v --remove-orphans
