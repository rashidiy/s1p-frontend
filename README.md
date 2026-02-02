# SIPCRM - Multi-Tenant Customer Relationship Management

A modern **multi-tenant CRM platform** built with Next.js 15, TypeScript, and Tailwind CSS. Features subdomain-based routing for owner and company portals, complete with Docker and Nginx support.

## Architecture

### Multi-Tenant Subdomain Routing

```
owner.domain.com      → Owner Portal (Platform Admin)
company1.domain.com   → Company Portal (company_subdomain=company1)
company2.domain.com   → Company Portal (company_subdomain=company2)
*.domain.com          → Dynamic Company Portals
```

**Nginx** handles subdomain extraction and passes it to **Next.js Middleware** which routes users to appropriate portals based on their subdomain.

### Deployment Options

1. **Docker + Nginx** (Production) - Subdomain-based multi-tenancy
2. **Standalone Next.js** (Development) - Query parameter testing

## Features

### Multi-Tenant Support
- **Owner Portal**: Manage multiple companies from `owner.domain.com`
- **Company Portals**: Each company has its own subdomain (e.g., `company1.domain.com`)
- **Automatic Routing**: Nginx + Middleware handle subdomain detection
- **Isolated Data**: Companies only see their own data

### Authentication
- User registration and login
- JWT token-based authentication
- Automatic token refresh
- Secure credential storage

### Dashboard
- Overview of call statistics
- Recent activity feed
- Active integrations summary
- Key performance metrics

### Integrations
- CRUD operations for SIPUNI integrations
- Manage company details and security keys
- Token management and regeneration
- Partner information tracking

### Calls
- Internal call initiation
- External call bridging
- Call tree execution
- Multi-integration support

### Statistics
- Call volume analytics
- Performance metrics
- Time-based filtering (daily, weekly, monthly, yearly)
- Visual data representation

### Settings
- Profile management
- Security settings
- Notification preferences
- API configuration

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- **For Development**: Node.js 18+, npm
- **For Production**: Docker & Docker Compose

### Option 1: Docker Production Setup (Recommended)

Perfect for production with full subdomain support:

```bash
# 1. Clone repository
git clone <repository-url>
cd SIPCRM-Front

# 2. Configure environment
cp .env.example .env
nano .env  # Edit with your settings

# 3. Build and start with Docker Compose
make build up

# Or without make:
docker-compose up -d --build

# 4. View logs
make logs
```

**Access:**
- Owner Portal: `http://owner.domain.com`
- Company Portal: `http://company1.domain.com`

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for detailed Docker configuration, SSL setup, and DNS configuration.

### Option 2: Development Setup

For local development without Docker:

```bash
# 1. Clone and install
git clone <repository-url>
cd SIPCRM-Front
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with development settings

# 3. Set up local subdomains (optional)
sudo make setup-hosts

# 4. Run development server
npm run dev
```

**Access with subdomain testing:**
- Owner Portal: `http://owner.localhost:3000`
- Company Portal: `http://company1.localhost:3000`

**Or use query parameters:**
- Owner: `http://localhost:3000?subdomain=owner`
- Company: `http://localhost:3000?subdomain=company1`

## Project Structure

```
SIPCRM-Front/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard page
│   │   ├── integrations/    # SIPUNI integrations management
│   │   ├── calls/          # Call operations
│   │   ├── statistics/     # Analytics and reports
│   │   ├── settings/       # User settings
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utility functions
│   │   ├── api.ts          # API client
│   │   └── utils.ts        # Helper functions
│   ├── store/              # State management
│   │   └── auth.ts         # Auth store
│   └── types/              # TypeScript types
│       └── api.ts          # API type definitions
├── public/                 # Static assets
└── package.json           # Dependencies
```

## API Integration

The application integrates with the backend API defined in the OpenAPI specification. Key endpoints:

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/refresh` - Token refresh

### SIPUNI Management
- `POST /api/v1/sipuni/create` - Create integration
- `GET /api/v1/sipuni/list` - List integrations
- `GET /api/v1/sipuni/detail` - Get integration details
- `PATCH /api/v1/sipuni/update` - Update integration
- `DELETE /api/v1/sipuni/delete` - Delete integration

### Call Operations
- `POST /api/v1/sipuni/internal_call` - Make internal call
- `POST /api/v1/sipuni/external_call` - Make external call
- `POST /api/v1/sipuni/call_tree` - Execute call tree

### Statistics
- `GET /api/v1/statistics/calls` - Get call statistics

## Quick Commands

### Using Makefile (Docker)

```bash
make build          # Build Docker images
make up             # Start containers
make down           # Stop containers
make restart        # Restart containers
make logs           # View all logs
make logs-nginx     # View Nginx logs only
make logs-nextjs    # View Next.js logs only
make ps             # Show running containers
make clean          # Remove all containers and images
make rebuild        # Full rebuild (down + build + up)
make setup-hosts    # Setup local /etc/hosts for subdomain testing
make test-subdomains # Test subdomain routing
make help           # Show all available commands
```

### Using Docker Compose Directly

```bash
docker-compose up -d --build    # Build and start
docker-compose down             # Stop containers
docker-compose logs -f          # Follow logs
docker-compose ps               # List containers
docker-compose restart nginx    # Restart specific service
```

### Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run linter
```

## Building for Production

### Docker (Recommended)

```bash
# Build and deploy with Docker
make build up

# Or step by step:
docker-compose build
docker-compose up -d
```

### Standalone

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Development

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (optional)

### Adding New Pages

1. Create a new directory under `src/app/`
2. Add a `page.tsx` file
3. Wrap content with `<AppLayout>` for authenticated pages
4. Add navigation link to `src/components/layout/sidebar.tsx`

### Adding New API Endpoints

1. Add types to `src/types/api.ts`
2. Add method to `src/lib/api.ts`
3. Use in components with proper error handling

## UI Components

The application uses shadcn/ui components built on Radix UI primitives:

- Button
- Card
- Input
- Label
- Select
- Dialog
- Badge
- Avatar
- Dropdown Menu

All components are fully customizable via Tailwind CSS classes.

## Authentication Flow

1. User registers or logs in
2. JWT tokens (access + refresh) are stored in localStorage
3. Access token is attached to all API requests
4. On token expiry, refresh token is used automatically
5. On refresh failure, user is redirected to login

## State Management

The application uses Zustand for state management:

- **Auth Store**: User authentication state
- Lightweight and performant
- No boilerplate required
- Easy to extend

## Responsive Design

The application is fully responsive:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Sidebar collapses on mobile (extendable)
- Cards stack on smaller screens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

See LICENSE file for details.
