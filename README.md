Below is a **professional, modern README** that would pass a junior → mid full-stack screening.
It explains **what the system is**, **how it’s built**, **how to run it**, and **what *you* contributed** — not just boilerplate.

You can copy-paste this directly into `README.md`.

---

# AI Task Manager

An AI-powered task management application built with **Next.js App Router**, **TypeScript**, **Prisma**, and **Tailwind CSS**.
The system demonstrates how AI can be integrated into a real product workflow by automatically classifying task priority using **OpenAI**.

This project is designed as a **full-stack reference implementation**, focusing on clean architecture, API design, and practical AI integration.

---

## ✨ Features

* Create, update, delete, and list tasks
* Automatic **AI-driven task priority classification**
* REST-style API routes using Next.js App Router
* Type-safe database access with Prisma
* Modern UI built with Tailwind CSS
* Deployed-ready architecture

---

## 🧠 System Architecture

This project follows a **clear separation of concerns** between UI, API, business logic, and external services.

### High-Level Flow

1. User creates or updates a task from the UI
2. The frontend calls internal API routes (`/api/tasks`)
3. Task data is persisted via Prisma to the database
4. For priority classification:

   * The frontend or API calls `/api/priority`
   * The API delegates to a centralized OpenAI helper
   * OpenAI returns a priority label
5. The result is stored and reflected in the UI

---

### Tech Stack

* **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
* **Backend:** Next.js API Routes
* **Database:** Prisma ORM + SQL database
* **AI Integration:** OpenAI Chat Completions API
* **Tooling:** ESLint, modern folder conventions

---

## 📁 Project Structure

```
.
├── app/                # App Router pages and API routes
│   ├── api/
│   │   ├── tasks/      # CRUD task endpoints
│   │   └── priority/   # AI priority classification endpoint
│   └── page.tsx        # Main UI entry
├── components/         # Reusable UI components
├── lib/
│   ├── openai.ts       # OpenAI client helper
│   └── prisma.ts       # Prisma client singleton
├── prisma/
│   └── schema.prisma   # Database schema
├── styles/
└── README.md
```

**Key architectural decisions:**

* Centralized OpenAI logic to avoid coupling AI calls to UI
* Prisma client isolated to prevent connection duplication
* API-first design: UI consumes the same APIs that could support mobile or external clients

---

## 🔌 API Endpoints

| Method | Endpoint         | Description                     |
| ------ | ---------------- | ------------------------------- |
| GET    | `/api/tasks`     | List all tasks                  |
| POST   | `/api/tasks`     | Create a new task               |
| PUT    | `/api/tasks/:id` | Update an existing task         |
| DELETE | `/api/tasks/:id` | Delete a task                   |
| POST   | `/api/priority`  | Classify task priority using AI |

---

## ⚙️ Installation & Local Setup

### Prerequisites

* Node.js 18+
* A SQL database (via Prisma)
* OpenAI API key

### Setup Steps

```bash
# 1. Environment variables
cp .env.example .env
```

Set the following in `.env`:

```env
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_api_key
```

```bash
# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🤖 AI Integration Details

The AI logic is encapsulated in:

```
lib/openai.ts
```

Responsibilities:

* Abstracts OpenAI API calls
* Keeps AI usage decoupled from UI and routing logic
* Makes it easy to swap models or providers later

The `/api/priority` route sends task content to OpenAI and returns a structured response:

```json
{ "priority": "low | medium | high" }
```

---

## 👨‍💻 My Contributions

This project was designed and implemented by me with a focus on **real-world engineering practices**, not just demos.

Specifically, I:

* Designed the **API-first architecture**
* Integrated **OpenAI into a real product workflow**
* Structured the project for scalability and maintainability
* Implemented full CRUD operations with Prisma
* Applied modern Next.js App Router patterns
* Ensured type safety across frontend and backend

This project reflects how I approach building production-ready systems, not just UI prototypes.

---

## 🚀 Future Improvements

* Authentication & user-scoped tasks
* Streaming AI responses
* Priority confidence scoring
* Background AI processing (queues)
* Role-based access control

---

## 📄 License

MIT

---

### Final note (from your senior engineer 😐)

This README is **good enough for hiring managers** because it:

* Explains *how the system works*
* Shows you understand architecture
* Proves AI integration is intentional, not gimmicky

If you want, next we can:

* Tighten this for **FAANG-style reviews**
* Add an **architecture diagram**
* Or rewrite it to target **startup recruiters vs enterprise**

Your move.
