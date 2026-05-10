# Writing Progress Tracker

A full-stack Next.js app for improving English writing with AI feedback, JWT authentication, Prisma-backed writing history, and weekly/monthly analytics.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM with Postgres
- JWT auth with HTTP-only cookies
- OpenAI Responses API with OpenRouter fallback
- Recharts

## Setup

1. Create or choose a Postgres database.
2. Copy `.env.example` to `.env.local`.
3. Add `DATABASE_URL` and a long random `JWT_SECRET`.
4. Add `OPENAI_API_KEY`, or add `OPENROUTER_API_KEY` to use free OpenRouter fallback models.
5. Run Prisma migrations.
6. Start the app.

```bash
cp .env.example .env.local
npm run prisma:migrate
npm run dev
```

Required variables:

```bash
DATABASE_URL=
JWT_SECRET=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.2
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-oss-120b:free
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=Writing Progress Tracker
```

Generate a strong JWT secret with a command such as:

```bash
openssl rand -base64 32
```

## Development

```bash
npm run dev
npm run prisma:generate
npm run prisma:migrate
npm run lint
npm run typecheck
npm run build
```

The analyzer tries OpenAI first when `OPENAI_API_KEY` is set. If OpenAI is not configured or the OpenAI request fails, it falls back to OpenRouter when `OPENROUTER_API_KEY` is set. OpenRouter defaults to `openai/gpt-oss-120b:free`, then falls back through `nvidia/nemotron-3-super-120b-a12b:free` and `openrouter/free`. If neither provider is configured, `/api/analyze-writing` returns a clear error and does not save a result.

## Main Routes

- `/dashboard`
- `/new`
- `/entries/[id]`
- `/history`
- `/analytics`
- `/login`
- `/signup`

## Data Protection

Signup and login create users in the Prisma `users` table. Sessions are signed JWTs stored in HTTP-only cookies. Prisma queries are server-only and always filter writing data by the authenticated `user.id`; the Prisma client is never exposed to the browser.
