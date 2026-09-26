# Two-Person Fullstack Team Workflow & Ownership Guide

This document outlines the collaborative workflow, module ownership, interface contracts, and integration procedures for the two fullstack engineers building the CE Strategies platform.

---

## 1. Team Responsibilities & Module Ownership

Both engineers operate fullstack (frontend and backend). Modules are partitioned along domain boundaries to eliminate merge collisions.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHARED CORE CONTRACTS                           │
│  - lib/types.ts: Domain models and enums                               │
│  - lib/db.ts: Global Prisma client singleton                           │
│  - docker-compose.yml: PostgreSQL 16 container setup                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
┌───────────────────────────────────┐   ┌────────────────────────────────┐
│           ENGINEER A              │   │           ENGINEER B           │
│    Data Ingestion & Triage        │   │    NLP & Executive Command     │
├───────────────────────────────────┤   ├────────────────────────────────┤
│ Backend:                          │   │ Backend:                       │
│ - prisma/schema.prisma (DB models)│   │ - lib/nlp-classifier.ts        │
│ - lib/csv-parser.ts (CSV stream)  │   │ - app/api/stats/route.ts       │
│ - lib/calgary-gazetteer.ts        │   │ - app/api/tweets/route.ts      │
│ - app/api/ingest/route.ts         │   │                                │
│ - app/api/triage/route.ts         │   │ Frontend:                      │
│                                   │   │ - app/page.tsx (Dashboard)     │
│ Frontend:                         │   │ - components/dashboard/*       │
│ - app/triage/page.tsx             │   │ - app/map/page.tsx (Map View)  │
│ - components/triage/*             │   │ - Filter & Search Toolbar      │
└───────────────────────────────────┘   └────────────────────────────────┘
```

---

## 2. Engineer A: Data Pipeline & Triage Workbench

### Objectives
1. Maintain database schema and Dockerized PostgreSQL service.
2. Ingest `main_contestant.csv` with maximum throughput and memory efficiency.
3. Provide the emergency dispatcher workbench for rapid signal verification.

### File Ownership
- `docker-compose.yml`
- `prisma/schema.prisma`
- `lib/csv-parser.ts`
- `lib/calgary-gazetteer.ts`
- `app/api/ingest/route.ts`
- `app/api/triage/route.ts`
- `app/triage/page.tsx`
- `components/triage/*`

### Key Deliverables
- **Batch CSV Ingest**: Process all 8,026 rows in < 5 seconds into Postgres using 250-row batch transactions.
- **Gazetteer Matching**: Match location strings to coordinates with alias resolution (e.g. "4th street" -> "Mission").
- **Dispatcher Workbench (`app/triage/page.tsx`)**:
  - Compact table view with urgency indicators.
  - Action modal to reclassify category, escalate urgency, or log dispatch notes.
  - Keyboard shortcuts (`V` = verify, `D` = dispatch, `X` = dismiss).

---

## 3. Engineer B: NLP Classification, Analytics & Operational Dashboard

### Objectives
1. Implement the multi-class disaster categorization engine.
2. Build the crisis analytics API and search/filtering query handlers.
3. Deliver the main executive command center dashboard and geospatial flood map.

### File Ownership
- `lib/nlp-classifier.ts`
- `app/api/stats/route.ts`
- `app/api/tweets/route.ts`
- `app/page.tsx`
- `app/map/page.tsx`
- `components/dashboard/*`
- `components/navbar.tsx`

### Key Deliverables
- **Disaster Classifier**: Accurate classification across the 7 categories (Rescue, Evacuation, Infrastructure, Volunteer, Aid, Advisory, Noise).
- **Aggregated Stats API**: Fast SQL aggregations returning counts by urgency, category, and location density.
- **Command Center Dashboard (`app/page.tsx`)**:
  - KPI banner showing live rescue counts, active outages, and cleanup requests.
  - Filterable live feed supporting full-text search and multi-select filters.
- **Geospatial Map (`app/map/page.tsx`)**:
  - Visual pin map of Calgary flood zones colored by dominant urgency.

---

## 4. Git & Branching Strategy

To maintain velocity without conflicts:

### Branch Naming
- `feat/eng-a-data-pipeline` (Engineer A working on ingestion / DB)
- `feat/eng-a-triage-ui` (Engineer A working on triage workbench)
- `feat/eng-b-nlp-engine` (Engineer B working on classification)
- `feat/eng-b-dashboard-map` (Engineer B working on dashboard & map)

### Pull Request & Review Protocol
1. Each branch must pass `bun run typecheck` (`tsc --noEmit`) before opening a PR.
2. Changes to shared contracts (`lib/types.ts` or `prisma/schema.prisma`) require mutual review and approval.
3. Merge using standard squash merges into `main`.

---

## 5. Development Milestones & Integration Points

| Milestone | Target | Dependencies |
|---|---|---|
| **M1: Foundation** | Docker DB running, Prisma pushed, types agreed upon | Both engineers |
| **M2: Pipeline & NLP** | CSV streaming ingestion working with NLP categorization | Eng A (Parser) + Eng B (Classifier) |
| **M3: API Layer** | Ingest, Tweets, Stats, and Triage endpoints operational | Eng A (Ingest/Triage) + Eng B (Tweets/Stats) |
| **M4: Frontend Views** | Dashboard, Map, and Triage Workbench styled and interactive | Eng A (Triage UI) + Eng B (Dashboard/Map) |
| **M5: Full Verification**| End-to-end testing with all 8,026 tweets triaged | Both engineers |
