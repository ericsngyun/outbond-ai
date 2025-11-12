# Outbond.ai

> **Personalize 100 cold emails in 10 minutes** — AI-powered SDR personalization platform for agencies and SMB SaaS doing outbound.

## 🚀 Quick Start (<5 minutes)

### Prerequisites

- Node.js 20.11.0+ (use `.nvmrc`)
- npm 10.0.0+
- PostgreSQL database (Neon recommended)

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repo-url>
   cd outbond-ai
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set at minimum:
   - `DATABASE_URL` — Your Neon Postgres connection string
   - `NEXT_PUBLIC_APP_URL` — http://localhost:3000

3. **Run database migrations**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Verify Installation

- **Health check**: `curl http://localhost:3000/api/health`
- **Version**: `curl http://localhost:3000/api/version`

---

## 📦 Stack

### Core

- **Frontend/API**: Next.js 15 (App Router), React 18.3, TypeScript 5.6
- **Styles/UI**: Tailwind CSS 3.4, Radix UI, shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Database**: Postgres (Neon) + Prisma 5.x + serverless adapter
- **Auth**: Clerk 5.x
- **Payments**: Stripe (Checkout + Portal)

### Services

- **Queue/Jobs**: BullMQ + Upstash Redis
- **Worker**: Node 20 (separate deploy to Fly.io/Railway)
- **Email**: Resend (transactional) + Gmail API (OAuth send)
- **LLM**: Anthropic Claude (primary), OpenAI mini (optional)
- **Observability**: Sentry SDK

### Hosting

- **Web/API**: Vercel
- **Database**: Neon Postgres
- **Redis**: Upstash
- **Worker**: Fly.io or Railway

---

## 🛠️ Scripts

### Development

```bash
npm run dev          # Start Next.js dev server
npm run worker:dev   # Start worker in watch mode
npm run db:studio    # Open Prisma Studio
```

### Code Quality

```bash
npm run lint         # ESLint (max 0 warnings)
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run typecheck    # TypeScript type checking
npm test             # Run Vitest tests
npm run test:watch   # Run tests in watch mode
```

### Build & Deploy

```bash
npm run build        # Build Next.js app
npm run worker:build # Build worker
npm start            # Start production server
```

### Database

```bash
npm run db:generate        # Generate Prisma Client
npm run db:push            # Push schema to DB (dev only)
npm run db:migrate         # Create & run migration
npm run db:migrate:deploy  # Deploy migrations (prod)
```

---

## 📁 Project Structure

```
outbond-ai/
├── app/                    # Next.js 15 App Router
│   ├── api/                # API routes
│   │   ├── health/         # Health check endpoint
│   │   └── version/        # Version info endpoint
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Tailwind imports + CSS vars
├── components/             # React components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Shared utilities
│   ├── env.ts              # Zod-validated environment
│   ├── db.ts               # Prisma client singleton
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration files
├── worker/                 # BullMQ worker (separate deploy)
│   ├── src/
│   │   ├── index.ts        # Worker entry point
│   │   └── jobs/           # Job processors
│   ├── package.json
│   └── tsconfig.json
├── __tests__/              # Vitest tests
├── public/                 # Static assets
├── .github/                # CI/CD & templates
│   ├── workflows/ci.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .editorconfig
├── .nvmrc                  # Node version
├── .prettierrc.json
├── eslint.config.mjs       # ESLint 9 flat config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── components.json         # shadcn/ui config
└── package.json
```

---

## 🔐 Environment Variables

See `.env.example` for all available variables. Required for bootstrap:

- `DATABASE_URL` — Postgres connection string
- `NEXT_PUBLIC_APP_URL` — App URL (localhost or production)

Optional services (configure as needed):

- Upstash Redis (for BullMQ worker)
- Clerk (authentication)
- Stripe (payments)
- Anthropic/OpenAI (LLM)
- Resend (email)
- Sentry (monitoring)

---

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI
```

Tests use Vitest + Testing Library. Coverage reports in `coverage/`.

---

## 🚢 Deployment

### Web/API (Vercel)

```bash
vercel
```

Ensure environment variables are set in Vercel dashboard.

### Worker (Fly.io)

```bash
cd worker
fly deploy
```

Or use Railway for simpler setup.

### Database Migrations

```bash
npm run db:migrate:deploy
```

Run this in CI or manually before deploying.

---

## 📋 Git Workflow

- **Branch strategy**: Trunk-based; short feature branches
- **Commits**: Conventional commits (`feat|fix|chore|refactor|docs|test|perf|build|ci`)
- **PRs required** for `main` branch
- **CI**: Lint, typecheck, test, build must pass

### Pre-commit Hooks

Husky + lint-staged automatically:

- Formats code with Prettier
- Lints with ESLint
- Runs on staged files only

---

## 🎯 Roadmap

### ✅ Phase 0: Bootstrap (Current)

- [x] Next.js 15 + TypeScript strict mode
- [x] Tailwind + shadcn/ui baseline
- [x] Prisma + Neon Postgres
- [x] Health & version API routes
- [x] Worker structure (BullMQ)
- [x] CI pipeline (GitHub Actions)
- [x] Code quality tools (ESLint, Prettier, Husky)

### 🔲 Phase 1: Auth & Billing

- [ ] Clerk authentication
- [ ] Stripe Checkout integration
- [ ] User dashboard skeleton
- [ ] Basic user model & migrations

### 🔲 Phase 2: Core Feature (CSV → LLM → CSV)

- [ ] CSV upload endpoint
- [ ] BullMQ job queue wiring
- [ ] LLM service (Anthropic Claude)
- [ ] Job processor (personalization)
- [ ] CSV export/download

### 🔲 Phase 3: Gmail Integration

- [ ] Gmail OAuth flow
- [ ] Send email via Gmail API
- [ ] Email templates

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make atomic commits with conventional format
3. Run `npm run lint && npm run typecheck && npm test`
4. Push and open a PR using the template
5. Ensure CI passes

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourorg/outbond-ai/issues)
- **Docs**: See `/docs` (coming soon)

---

Built with ❤️ by Eric
