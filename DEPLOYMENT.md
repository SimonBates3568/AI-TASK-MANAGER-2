Deployment checklist — Neon + Vercel

Overview
This project uses Next.js (App Router), Prisma, and Neon (Postgres) in production. The local dev database may be SQLite; production uses Neon.

Pre-requisites
- Neon project and connection string (DATABASE_URL)
- Vercel account and project
- GitHub repo connected to Vercel (recommended)
- GitHub OAuth app configured (for NextAuth GitHub provider)

Env vars (set these in Vercel Project Settings -> Environment Variables)
- DATABASE_URL: Neon connection string (e.g. postgresql://... ?sslmode=require)
- NEXTAUTH_URL: https://your-app.vercel.app
- NEXTAUTH_SECRET: generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- OPENAI_API_KEY: your OpenAI key
- GITHUB_ID and GITHUB_SECRET: from GitHub OAuth app
- OPTIONAL: NEXTAUTH_DEBUG=false (do not enable in production)

Recommended package.json scripts
- prisma:migrate -> Runs `prisma migrate deploy` (use in CI or locally to apply migrations)
- prisma:migrate:dev -> For local development when you need to create a new migration
- prisma:generate -> Generates Prisma client
- seed -> `node prisma/seed.js` to populate demo data

Deploy steps (summary)
1. Commit all changes and push to GitHub.
2. Add env vars above in Vercel (or via Vercel CLI using `vercel env add ...`).
3. Configure GitHub OAuth callback to: `https://your-app.vercel.app/api/auth/callback/github`.
4. Run migrations against Neon (locally or in CI):
   export DATABASE_URL="postgresql://..."
   npx prisma migrate deploy
   npx prisma generate
5. Import the GitHub repo into Vercel and deploy (or run `vercel --prod`).
6. Smoke test: sign in, create/edit tasks, ensure data is written to Neon.

Notes
- We moved sqlite migrations into `prisma/migrations_sqlite_backup/` when switching to Neon. Production now has a fresh Postgres migration history.
- For serverless DB connection scaling consider Prisma Data Proxy or Neon connection pooling.

If you want, I can add these env vars to Vercel for you using the values in your `.env.local`.
