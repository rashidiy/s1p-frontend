.PHONY: help build up down restart logs clean dev install

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run development server
	npm run dev

build: ## Build Docker images
	docker-compose build --no-cache

up: ## Start Docker containers
	docker-compose up -d

down: ## Stop Docker containers
	docker-compose down

restart: ## Restart Docker containers
	docker-compose restart

logs: ## View Docker logs
	docker-compose logs -f

logs-nginx: ## View Nginx logs
	docker-compose logs -f nginx

logs-nextjs: ## View Next.js logs
	docker-compose logs -f nextjs

shell-nginx: ## Open shell in Nginx container
	docker-compose exec nginx sh

shell-nextjs: ## Open shell in Next.js container
	docker-compose exec nextjs sh

ps: ## Show running containers
	docker-compose ps

clean: ## Remove containers, volumes, and images
	docker-compose down -v --rmi all

rebuild: down build up ## Rebuild and restart all containers

setup-hosts: ## Setup local /etc/hosts for subdomain testing (requires sudo)
	@echo "This will modify your /etc/hosts file. Continue? [y/N]"
	@read ans && [ $${ans:-N} = y ] && sudo ./scripts/setup-local-hosts.sh || echo "Cancelled"

test-subdomains: ## Test subdomain routing
	@echo "Testing subdomain routing..."
	@echo "Owner Portal:"
	@curl -s -H "Host: owner.domain.com" http://localhost | head -5 || echo "Failed to connect"
	@echo "\nCompany Portal:"
	@curl -s -H "Host: company1.domain.com" http://localhost | head -5 || echo "Failed to connect"
