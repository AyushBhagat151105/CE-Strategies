# CE Strategies — Crisis Response Informatics Platform (CLAUDE.md)

This file provides comprehensive context, architectural rules, tech stack details, and engineering standards for AI assistants and human developers working on this codebase.

---

## 1. Project Overview & Domain Context

- **Challenge**: CE Strategies Disaster Informatics Challenge.
- **Dataset**: `main_contestant.csv` (8,026 disaster-related social media tweets from the June–July 2013 Alberta/Calgary floods).
- **Core Mission**: Transform noisy, unstructured crisis social media streams into actionable emergency intelligence:
  - Triage life-safety rescue requests and evacuation orders.
  - Detect critical infrastructure failures (power outages, bridge closures, road washouts).
  - Coordinate grassroots volunteer aid (`#yychelps`, cleanup crews, mudding out).
  - Resolve geographic locations to Calgary flood zones (Mission, Beltline, Bowness, Sunnyside, High River, Saddledome).
  - Filter out conversational noise, synthetic inserts, and irrelevant posts.

---

## 2. Tech Stack & Architectural Principles

| Layer | Selection | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | Single standalone root app; no Turborepo; no subfolders |
| Runtime & PM | Bun | Used for package management, running scripts, and development |
| Language | TypeScript 5 (Strict Mode) | Strict typing across all files; zero `any` types |
| Database | PostgreSQL 16 Alpine | Managed via Docker Compose (`docker-compose.yml`) |
| ORM | Prisma Client | Multi-model schema in `prisma/schema.prisma` |
| API Layer | Native Next.js App Router | Route Handlers (`app/api/*`) and Server Actions; **no tRPC** |
| Styling | Tailwind CSS | Utility-first, dark mode default |
| Icons | Lucide React | Clean, tree-shakeable icons |

---

## 3. Directory Structure

```
/home/ayushbhagat/Data/CE Strategies/
├── app/
│   ├── api/
│   │   ├── ingest/route.ts       # CSV dataset ingestion & batch database streaming
│   │   ├── tweets/route.ts       # Filterable, paginated query endpoint for tweets
│   │   ├── stats/route.ts        # Aggregated crisis KPIs & category analytics
│   │   └── triage/route.ts       # Status mutation & operator verification actions
│   ├── layout.tsx                # Global shell, navigation, and theme provider
│   ├── page.tsx                  # Main operational crisis command center
│   └── globals.css               # Tailwind directives and CSS theme variables
├── components/
│   ├── ui/                       # Lightweight UI primitives (Button, Badge, Card, Dialog)
│   ├── navbar.tsx                # Global header with status indicator and navigation
│   ├── dashboard/                # Command center widgets (Metrics, Feed, Map, Analytics)
│   └── triage/                   # Dispatcher queue, action modals, and quick shortcuts
├── lib/
│   ├── db.ts                     # Prisma Client singleton with connection pooling guard
│   ├── types.ts                  # Domain models, enums (CrisisCategory, UrgencyLevel)
│   ├── nlp-classifier.ts         # Multi-class crisis signal triage engine
│   ├── calgary-gazetteer.ts      # Calgary flood zone coordinate resolver
│   └── csv-parser.ts             # Memory-efficient streaming CSV parser
├── prisma/
│   └── schema.prisma             # PostgreSQL schema definition
├── docs/                         # Detailed architecture, workflow, and dataset docs
│   ├── ARCHITECTURE.md           # System design & component interaction
│   ├── TEAM_WORKFLOW.md          # 2-person fullstack development guide
│   └── DATASET.md                # 2013 Calgary flood dataset analysis & taxonomy
├── docker-compose.yml            # PostgreSQL 16 container definition
├── main_contestant.csv           # 8,026 crisis tweets source data
├── package.json                  # Root package manifest & scripts
├── tsconfig.json                 # Strict TypeScript configuration
└── next.config.ts                # Next.js configuration
```

---

## 4. Common Commands

### Infrastructure & Database
```bash
# Start Dockerized PostgreSQL container
bun run docker:up

# Stop Dockerized PostgreSQL container
bun run docker:down

# View database container logs
bun run docker:logs

# Push Prisma schema to the database (development)
bun run db:push

# Generate Prisma Client
bun run db:generate

# Open interactive Prisma Studio GUI (http://localhost:5555)
bun run db:studio
```

### Application Development
```bash
# Install dependencies
bun install

# Start development server (http://localhost:3000)
bun dev

# Run TypeScript typecheck
bun run typecheck

# Build for production
bun run build
```

---

## 5. Two-Person Fullstack Team Architecture

The codebase is partitioned into two clear fullstack tracks so both engineers can develop concurrently without merge conflicts:

### Engineer A: Data Ingestion, Geospatial Engine & Triage Workbench
- **Docker & DB**: Database migrations, indexes, and connection optimization.
- **Data Pipeline**: `lib/csv-parser.ts` streaming ingestion of `main_contestant.csv`.
- **Geospatial Engine**: `lib/calgary-gazetteer.ts` coordinate mapping and fuzzy matching.
- **Backend**: `app/api/ingest/route.ts` and `app/api/triage/route.ts`.
- **Frontend**: Emergency dispatcher queue (`app/triage/page.tsx`), keyboard triage shortcuts, and verification dialogs.

### Engineer B: NLP Classification, Analytics API & Operations Dashboard
- **NLP Engine**: `lib/nlp-classifier.ts` multi-class disaster categorization and urgency scoring.
- **Backend**: `app/api/stats/route.ts` and `app/api/tweets/route.ts` (filtering & search).
- **Frontend**: Main dashboard (`app/page.tsx`), KPI summary cards, crisis category charts.
- **Mapping**: Interactive geospatial map (`app/map/page.tsx`) plotting flood zones and tweet density.

---

## 6. Code Quality Standards (Strict `AGENTS.md` Enforcement)

- **Senior Human Engineer Quality**: Write clean, idiomatic TypeScript that reads like plain English.
- **Zero "AI Slop"**: No bloated comments, no decorative banners, no narration of diffs.
- **Comments Explain WHY**: Never state what the code already demonstrates.
- **Strict Typing**: No `any`; use strict interfaces from `lib/types.ts` or `unknown` with narrowing.
- **Error Handling**: Use typed errors; don't wrap code in meaningless `try/catch` blocks unless adding actionable context or returning structured HTTP responses.
- **Small Functions**: Every function does one thing cleanly. If a function or component is doing multiple jobs, split it before committing.
