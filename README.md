# SIPCRM - Customer Relationship Management

A modern CRM application built with Next.js 15, TypeScript, and Tailwind CSS for managing SIPUNI integrations and call operations.

## Features

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

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SIPCRM-Front
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your API base URL:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
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
