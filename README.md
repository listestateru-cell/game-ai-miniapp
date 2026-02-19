# Telegram Mini App Game

A production-grade Telegram Mini App with subscriptions via Telegram Stars and a safe earning system.

## Architecture

- **game-core**: Pure game logic (TypeScript)
- **web-ui**: React + Vite frontend for Telegram WebApp
- **backend**: Node.js + Express + Prisma backend

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in your values
3. Start the database: `docker-compose up -d`
4. Install dependencies: `pnpm install`
5. Run migrations: `pnpm --filter backend db:migrate`
6. Start dev: `pnpm dev`

## No global pnpm required

If you don't have pnpm installed globally, use one of these options:

### Option 1: Corepack (recommended)
```bash
corepack enable
corepack prepare pnpm@9.12.0 --activate
pnpm install
```

### Option 2: npx fallback
Use `npx -y pnpm@9.12.0 <command>` for any pnpm command, e.g.:
```bash
npx -y pnpm@9.12.0 install
npx -y pnpm@9.12.0 dev
```

## Scripts

- `pnpm install`: Install all dependencies
- `pnpm dev`: Start backend and web-ui concurrently
- `pnpm build`: Build all packages
- `pnpm typecheck`: Run TypeScript checks across all packages
- `pnpm start`: Start backend only
- `pnpm --filter backend db:migrate`: Run database migrations

- `npm run dev`: Start all services in dev mode
- `npm run build`: Build all packages
- `npm run start`: Start production server
- `npm run db:migrate`: Run Prisma migrations

## Telegram Setup

1. Create a bot with @BotFather
2. Enable payments in the bot settings
3. Set webhook for payments: `https://your-domain.com/payments/telegram/webhook`

## Deployment

Deploy web-ui to a static host, backend to a server with DB.
