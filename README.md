# CE Strategies — Crisis Response Informatics Platform

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Bun](https://img.shields.io/badge/Bun-1.2-fbf0df?logo=bun)](https://bun.sh/)

A real-time disaster situational awareness and triage platform built for the **CE Strategies Disaster Informatics Challenge**. The system ingests, filters, classifies, and geolocates 8,026 social media crisis signals from the **June–July 2013 Calgary and Alberta floods** (`main_contestant.csv`).

---

## Features

- **Multi-Class Crisis Triage**: Deterministic NLP engine categorizing incoming streams into 7 operational buckets:
  - `RESCUE` (Life-safety emergencies, trapped residents, 911 calls)
  - `EVACUATION` (Mandatory evacuation zones, reception centers, shelter needs)
  - `INFRASTRUCTURE` (Power outages, ENMAX substations, bridge and road closures)
  - `VOLUNTEER` (`#yychelps`, cleanup crews, mudding out, equipment requests)
  - `AID` (Food banks, clothing, medical supplies, Red Cross donations)
  - `ADVISORY` (Municipal press briefings, Mayor Nenshi announcements)
  - `NOISE` (Conversational chatter, sports, synthetic benchmark text)
- **Calgary Geospatial Gazetteer**: Automatically matches text mentions to coordinates for affected flood communities along the Bow and Elbow rivers (Mission, Beltline, Cliff Bungalow, Bowness, Sunnyside, Inglewood, Saddledome, High River).
- **Emergency Dispatcher Queue**: High-throughput triage workbench (`/triage`) for human verification, urgency escalation, and responder dispatching with audit logging.
- **Crisis Operations Command Center**: Live metrics dashboard (`/`) and interactive geospatial flood map (`/map`).
- **High-Performance Ingestion**: Streaming batch processor capable of loading the 8,026-row dataset into PostgreSQL in seconds.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Database**: [PostgreSQL 16](https://www.postgresql.org/) hosted via Docker Compose
- **ORM**: [Prisma](https://www.prisma.io/)
- **Runtime & Package Manager**: [Bun](https://bun.sh/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark mode default
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Quick Start

### 1. Prerequisites
- [Bun](https://bun.sh/) installed locally
- [Docker](https://www.docker.com/) and Docker Compose installed and running

### 2. Installation
```bash
# Clone the repository and enter the directory
cd "CE Strategies"

# Install project dependencies
bun install
```

### 3. Start Database (Docker)
```bash
# Launch PostgreSQL 16 container in background
bun run docker:up

# Verify container health
docker compose ps
```

### 4. Database Setup
```bash
# Push Prisma schema to create tables
bun run db:push

# (Optional) Open Prisma Studio GUI
bun run db:studio
```

### 5. Start Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
.
├── app/
│   ├── api/
│   │   ├── ingest/route.ts       # POST: Stream main_contestant.csv into PostgreSQL
│   │   ├── tweets/route.ts       # GET: Filterable, paginated crisis tweets query
│   │   ├── stats/route.ts        # GET: Real-time urgency, category, and location KPIs
│   │   └── triage/route.ts       # PATCH: Operator verification and dispatch actions
│   ├── globals.css               # Tailwind directives and CSS theme variables
│   ├── layout.tsx                # App shell, navigation header, and theme
│   └── page.tsx                  # Executive crisis response dashboard
├── components/
│   ├── navbar.tsx                # Global navigation with live status indicator
│   └── ui/                       # Accessible UI primitives (Button, Badge, Card)
├── docs/                         # Detailed architecture and workflow guides
│   ├── ARCHITECTURE.md           # System design, data models, and API contracts
│   ├── TEAM_WORKFLOW.md          # 2-person fullstack development guide & file ownership
│   └── DATASET.md                # 2013 Calgary flood dataset analysis & taxonomy
├── lib/
│   ├── calgary-gazetteer.ts      # Calgary flood zone coordinate resolver
│   ├── csv-parser.ts             # Memory-efficient streaming CSV parser
│   ├── db.ts                     # Global Prisma Client singleton
│   ├── nlp-classifier.ts         # Multi-class disaster categorization engine
│   └── types.ts                  # Strict domain TypeScript interfaces and enums
├── prisma/
│   └── schema.prisma             # PostgreSQL schema (CrisisTweet, TriageLog, etc.)
├── .env                          # Local environment variables
├── .env.example                  # Template environment variables
├── CLAUDE.md                     # AI context and engineering standard rules
├── docker-compose.yml            # PostgreSQL 16 container definition
├── main_contestant.csv           # 8,026 crisis tweets source data
├── next.config.ts                # Next.js configuration
├── package.json                  # Root manifest and scripts
├── tailwind.config.ts            # Tailwind styling config
└── tsconfig.json                 # TypeScript strict configuration
```

---

## Two-Person Fullstack Team Architecture

The project is structured into two decoupled fullstack workstreams to enable concurrent development with minimal merge conflicts:

| Track | Primary Responsibilities | Key Files |
|---|---|---|
| **Engineer A** *(Data Pipeline & Triage)* | Database migrations, CSV stream ingestion, Calgary geospatial gazetteer, Ingest/Triage APIs, Dispatcher Triage Workbench | `docker-compose.yml`, `prisma/schema.prisma`, `lib/csv-parser.ts`, `lib/calgary-gazetteer.ts`, `app/api/ingest/route.ts`, `app/api/triage/route.ts`, `app/triage/page.tsx` |
| **Engineer B** *(NLP Engine & Operations)* | Multi-class disaster classifier, Stats/Tweets APIs, Command Center Dashboard, Geospatial Map View, Search/Filter Toolbar | `lib/nlp-classifier.ts`, `app/api/stats/route.ts`, `app/api/tweets/route.ts`, `app/page.tsx`, `app/map/page.tsx`, `components/dashboard/*` |

*For complete team protocols and branching strategy, see [docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md).*

---

## Documentation Links

- **[CLAUDE.md](CLAUDE.md)**: Master developer and AI context file (stack conventions, coding standards, commands).
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**: Detailed system design, data flow diagrams, schema models, and API specs.
- **[docs/TEAM_WORKFLOW.md](docs/TEAM_WORKFLOW.md)**: 2-person fullstack ownership matrix, git branching strategy, and integration milestones.
- **[docs/DATASET.md](docs/DATASET.md)**: Calgary flood crisis background, dataset analysis, noise suppression patterns, and community coordinates.

---

## Common Scripts

```bash
# Development
bun dev               # Start Next.js dev server (localhost:3000)
bun run build         # Build production Next.js bundle
bun run typecheck     # Run strict TypeScript check (tsc --noEmit)

# Database
bun run docker:up     # Start PostgreSQL container
bun run docker:down   # Stop PostgreSQL container
bun run docker:logs   # View PostgreSQL logs
bun run db:push       # Synchronize Prisma schema with database
bun run db:studio     # Open Prisma Studio GUI (localhost:5555)
```
