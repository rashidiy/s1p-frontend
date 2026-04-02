# S1P — CRM Frontend for Call Centers

Web interface for the S1P multi-tenant CRM. Three portals in one app: landing page, company CRM, and platform admin. Includes a Telegram Mini App for mobile CRM access.

Live at [s1p.uz](https://s1p.uz) · Backend: [s1p-backend](https://github.com/rashidiy/s1p-backend)

---

## Features

- **Three portals, one app** — Landing page (`s1p.uz`), company CRM (`company.s1p.uz`), owner admin (`owner.s1p.uz`). Subdomain routing via Next.js middleware + Nginx.
- **Full CRM interface** — Leads, deals, contacts, tasks, calls, analytics, team management. Detail views, create/edit forms, search and filtering.
- **Deals pipeline** — Drag-and-drop Kanban board for deal stage management.
- **Call management** — Initiate calls, view call history, listen to recordings, track call outcomes.
- **Telegram Mini App** — Full CRM access inside Telegram. Leads, deals, contacts, calls, pipeline view, profile.
- **Analytics dashboard** — Call volume, lead conversion, deal progress, team productivity. Charts via Recharts.
- **Settings** — Sipuni/Binotel setup, Telegram bot config, custom fields, permission groups, API keys, webhooks.
- **i18n** — English, Russian, Uzbek. Full UI translation via next-intl.
- **E2E tests** — Playwright tests for auth, contacts, deals, navigation.

## Tech Stack

- [Next.js 15](https://nextjs.org/) — App Router, server components, middleware for subdomain routing.
- [TypeScript](https://typescriptlang.org/) — Full type safety across the app.
- [Ant Design](https://ant.design/) — UI component library. Tables, forms, modals, notifications.
- [Zustand](https://zustand-demo.pmnd.rs/) — Lightweight state management for auth and theme.
- [Recharts](https://recharts.org/) — Analytics charts and dashboards.
- [Framer Motion](https://framer.com/motion/) — Animations on the landing page.
- [Playwright](https://playwright.dev/) — End-to-end testing.
- [next-intl](https://next-intl-docs.vercel.app/) — Internationalization (en/ru/uz).

## Architecture

```
s1p.uz                    → Landing page (marketing)
owner.s1p.uz              → Owner portal (platform admin)
{company}.s1p.uz          → Company portal (tenant CRM)
{company}.s1p.uz/miniapp  → Telegram Mini App

┌─────────────────────────────────────────────────┐
│                  Next.js Middleware              │
│         Extract subdomain → route to portal     │
└──────────────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
  ┌─────▼─────┐  ┌────▼─────┐  ┌────▼──────┐
  │  Landing  │  │  Owner   │  │  Company  │
  │  (landing)│  │  Portal  │  │  Portal   │
  │           │  │          │  │           │
  │ Hero      │  │ Companies│  │ Dashboard │
  │ Features  │  │ Contracts│  │ Leads     │
  │ Pricing   │  │ Analytics│  │ Deals     │
  │ FAQ       │  │ Perms    │  │ Contacts  │
  └───────────┘  └──────────┘  │ Calls     │
                               │ Tasks     │
                               │ Analytics │
                               │ Settings  │
                               │ Mini App  │
                               └───────────┘
                                     │
                              ┌──────▼───────┐
                              │ s1p-backend  │
                              │ FastAPI API  │
                              └──────────────┘
```

**Subdomain routing:** Nginx extracts the subdomain and forwards it as a header. Next.js middleware reads the header and routes to the correct portal layout. No separate deployments — one Next.js app serves all portals.

## Project Structure

```
src/
├── app/
│   ├── (landing)/        # Marketing site — hero, features, pricing, FAQ
│   ├── (company)/        # Tenant CRM portal
│   │   ├── dashboard/    # Overview, stats, recent activity
│   │   ├── leads/        # Lead list, detail, create
│   │   ├── deals/        # Deal list, detail, pipeline Kanban
│   │   ├── contacts/     # Contact list, detail, create
│   │   ├── calls/        # Call history, recordings
│   │   ├── tasks/        # Task list, detail, create
│   │   ├── analytics/    # Charts, reports
│   │   ├── users/        # Team management, invites
│   │   └── settings/     # Sipuni, Telegram, custom fields, API keys
│   ├── owner/            # Platform admin portal
│   │   ├── dashboard/    # Platform-wide stats
│   │   ├── companies/    # Manage tenants
│   │   └── contracts/    # License management
│   ├── miniapp/          # Telegram Mini App
│   │   ├── leads/, deals/, contacts/, calls/
│   │   ├── pipeline/     # Kanban view
│   │   └── profile/
│   └── login/
├── components/
│   ├── auth/             # Protected routes, auth layout
│   ├── deals/            # Pipeline Kanban view
│   ├── illustrations/    # Empty state characters
│   └── layout/           # Sidebar navigation
├── lib/                  # API client, utils, subdomain detection
├── store/                # Zustand stores (auth, theme)
├── messages/             # i18n translations (en, ru, uz)
└── e2e/                  # Playwright test specs
```

## Getting Started

### Prerequisites

- Node.js 18+
- Running [s1p-backend](https://github.com/rashidiy/s1p-backend) instance

### Development

```bash
git clone https://github.com/rashidiy/s1p-frontend.git
cd s1p-frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend
npm run dev
```

Access at `http://localhost:3000`. For subdomain testing: `http://owner.localhost:3000`, `http://company.localhost:3000`.

### Docker

```bash
cp .env.example .env
docker compose up -d --build
```

### E2E Tests

```bash
npx playwright install
npx playwright test
```

## License

MIT
