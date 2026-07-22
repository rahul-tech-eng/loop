 # LOOP — AI Customer Feedback Intelligence Platform

> "Close the loop on customer feedback."

LOOP is a corporate-grade web application that helps companies make sense of customer feedback. It ingests support tickets, app-store reviews, survey responses, and sales notes — then uses AI to classify, cluster, and surface what's trending.

---

## 🚀 Live Demo

**Production URL:** `https://your-vercel-url.vercel.app`

**Demo credentials:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@acme.com | password123 |
| Analyst | analyst@acme.com | password123 |
| Viewer | viewer@acme.com | password123 |

---

## ✨ Features

- **Multi-tenant workspaces** — each company's data is fully isolated
- **Role-based access control** — Admin, Analyst, Viewer roles
- **Feedback ingestion** — manual entry, CSV bulk upload, simulated channels
- **Feedback inbox** — search, filter, pagination, status workflow
- **Analytics dashboard** — volume, sentiment, top themes charts
- **AI auto-classification** — sentiment, themes, feature area via Gemini AI
- **Theme clustering** — group similar feedback into named themes
- **Trends view** — spike detection vs previous period
- **Ask LOOP** — plain-English Q&A grounded in real feedback
- **Voice-of-Customer reports** — AI-generated weekly digests with PDF export

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | NextAuth |
| AI | Google Gemini API |
| Charts | Recharts |
| Validation | Zod |
| Deployment | Vercel |

---

## 🏗 Architecture

LOOP follows a standard three-tier architecture:

Browser (React Server/Client Components)
↓
API Layer (Next.js Route Handlers)

Auth guard on every route
Role check on every route
Every query scoped by workspaceId
↓
Services (lib/)
ai.ts — Gemini classification + report generation
search.ts — keyword-based feedback retrieval
db.ts — Prisma client
↓
Database (PostgreSQL via Prisma ORM)

**Security rule:** Every database query is filtered by `workspaceId`. Company A can never read Company B's data.

---

## 📦 Local Setup

### Prerequisites
- Node.js 18+
- Git
- A PostgreSQL database (Neon free tier)
- A Google Gemini API key (free at aistudio.google.com)

### Steps

**1. Clone the repository:**
```bash
git clone https://github.com/your-username/loop.git
cd loop
```

**2. Install dependencies:**
```bash
npm install
```

**3. Set up environment variables:**
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
DATABASE_URL=your-neon-postgresql-url
NEXTAUTH_SECRET=any-random-secret-string
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

**4. Run database migrations:**
```bash
npx prisma migrate dev
```

**5. Seed the database:**
```bash
npm run seed
```

**6. Start the development server:**
```bash
npm run dev
```

Open `http://localhost:3000` and log in with the demo credentials above.

---

## 🌱 Seed Data

The seed script creates:
- 1 demo workspace (Acme Corp)
- 3 users (one per role)
- 120+ realistic feedback items across all channels
- 6 themes (Onboarding, Performance, Billing, Mobile, SSO/Auth, Uncategorised)

Run it with:
```bash
npm run seed
```

---

## 📁 Project Structure

loop/
├── app/
│ ├── (auth)/ # Login, signup pages
│ ├── (app)/ # Protected app pages
│ │ ├── dashboard/ # Analytics dashboard
│ │ ├── inbox/ # Feedback inbox
│ │ ├── themes/ # Theme clustering
│ │ ├── trends/ # Trends & spike detection
│ │ ├── ask/ # Ask LOOP Q&A
│ │ ├── reports/ # VoC reports
│ │ └── settings/ # Team management
│ └── api/ # Route handlers
│ ├── feedback/ # CRUD + classification
│ ├── themes/ # Theme clustering
│ ├── trends/ # Trend analysis
│ ├── insights/ # Ask LOOP Q&A
│ └── reports/ # VoC generation
├── components/ # UI components
├── lib/
│ ├── ai.ts # Gemini AI calls
│ ├── search.ts # Feedback retrieval
│ ├── auth.ts # Session + role guards
│ └── db.ts # Prisma client
└── prisma/
├── schema.prisma # Database schema
└── seed.ts # Seed script


---

## 📸 Screenshots

> Add screenshots of your app here

- Dashboard
- Feedback Inbox
- Themes page
- Trends view
- Ask LOOP
- VoC Report

---

## 🎥 Demo Video

`https://your-demo-video-link-here`

---

## 👤 Author

Built by [Rahul Chand] as part of the Zidio Development Internship Program.