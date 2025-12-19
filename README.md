# AI Task Manager

This is a starter Next.js (App Router) + TypeScript + Tailwind + Prisma project that demonstrates an AI-powered task priority classifier using OpenAI.

Quick steps to run locally:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `OPENAI_API_KEY`.
2. npm install
3. npx prisma generate
4. npx prisma migrate dev --name init
5. npm run dev

API endpoints:
- `GET /api/tasks` — list
- `POST /api/tasks` — create
- `PUT /api/tasks/:id` — update
- `DELETE /api/tasks/:id` — delete
- `POST /api/priority` — returns { priority }

Notes:
- This scaffold includes a simple OpenAI helper (`lib/openai.ts`) which calls the OpenAI Chat Completions API. Make sure your `OPENAI_API_KEY` is set.
- The UI components are in `components/` and pages are in `app/`.
