# Two-Developer Implementation Checklist & Roadmap

This document serves as the master execution checklist for Developer 1 (Engineer A) and Developer 2 (Engineer B). Use this file to track progress, coordinate handoffs, and check off items as you build the CE Strategies Crisis Response Informatics Platform.

---

## Phase 0: Immediate Joint Kick-Off (Both Developers)

Run these steps together before splitting into separate workstreams:

- [x] **Step 1: Install Dependencies**
  ```bash
  bun install
  ```
- [x] **Step 2: Start PostgreSQL Database Container**
  ```bash
  bun run docker:up
  ```
  *Note: host port 5432 was already taken by another local project's container, so this project's DB is mapped to host port 5434 instead (see `docker-compose.yml` and `.env`).*
- [x] **Step 3: Verify PostgreSQL Container Health**
  ```bash
  docker compose ps
  ```
- [x] **Step 4: Push Prisma Schema to PostgreSQL**
  ```bash
  bun run db:push
  ```
- [x] **Step 5: Verify Next.js Dev Server**
  ```bash
  bun dev
  ```
  *Open http://localhost:3000 to verify the Command Center loads cleanly.*
  *Note: port 3000 was also taken locally, so dev server ran on port 3001 during verification.*

---

## Developer 1 (Engineer A) — Data Pipeline & Triage Workbench

> **Domain**: Data persistence, streaming ingestion of all 8,026 tweets, geographic community coordinate matching, and the emergency dispatcher triage workbench.
> **Git Branch**: `feat/eng-a-ingest-triage`

### Checklist

- [x] **Task A1: Verify Database Schema & GUI**
  - **Files**: `prisma/schema.prisma`
  - **Action**: Run `bun run db:push` followed by `bun run db:studio` (open http://localhost:5555).
  - **Done Criteria**: Tables `CrisisTweet`, `TriageLog`, `LocationGazetteer`, and `AidRequest` are visible with proper column types and indexes.

- [x] **Task A2: Streaming CSV Ingestion Pipeline**
  - **Files**: `lib/csv-parser.ts` & `app/api/ingest/route.ts`
  - **Action**:
    - Stream `main_contestant.csv` line-by-line via `readline` to keep memory footprint under 50MB.
    - Batch inserts in chunks of 250 rows using `prisma.crisisTweet.createMany({ skipDuplicates: true })`.
    - Handle multi-line quotes and clean escaped CSV quotes (`""` $\to$ `"`).
  - **Done Criteria**: `curl -X POST http://localhost:3000/api/ingest` loads all 8,026 rows into PostgreSQL in < 5 seconds.

- [x] **Task A3: Calgary Geospatial Gazetteer**
  - **Files**: `lib/calgary-gazetteer.ts`
  - **Action**:
    - Expand neighbourhood aliases to cover colloquial mentions (`"mission"`, `"4th street"`, `"cliff bungalow"`, `"beltline"`, `"17th ave"`, `"bowness"`, `"sunnyside"`, `"kensington"`, `"saddledome"`, `"stampede"`, `"high river"`).
    - Implement word-boundary regex (`/\bmission\b/i`) to prevent false positives (e.g., "commission" or "transmission").
  - **Done Criteria**: `extractCalgaryLocation(text)` accurately returns community name and `{ latitude, longitude }`.

- [x] **Task A4: Triage & Audit Route Handler**
  - **Files**: `app/api/triage/route.ts`
  - **Action**:
    - Handle `PATCH` requests accepting `{ tweetId, status, urgency, category, isVerified, notes, operatorName }`.
    - Run an atomic Prisma transaction (`prisma.$transaction`) that updates the `CrisisTweet` and logs an entry in `TriageLog`.
  - **Done Criteria**: Updating a tweet records the previous and new values in `TriageLog`.

- [x] **Task A5: Emergency Dispatcher Triage Queue Page**
  - **Files**: `app/triage/page.tsx` & `components/triage/*`
  - **Action**:
    - Create a high-density table showing unreviewed crisis signals.
    - Add quick action buttons: **Verify**, **Escalate**, **Dispatch**, and **Dismiss**.
    - Implement keyboard shortcuts:
      - `V` = Verify focused tweet
      - `1`–`4` = Set urgency (Critical, High, Medium, Low)
      - `X` = Dismiss / flag as noise
  - **Done Criteria**: Dispatchers can triage alerts entirely using the keyboard.

- [x] **Task A6: Dispatcher Action Modal**
  - **Files**: `components/triage/action-dialog.tsx`
  - **Action**:
    - Popup modal when clicking a tweet showing full raw text, matched keywords, category re-assignment dropdown, and operator notes input.
  - **Done Criteria**: Operator notes save cleanly to `TriageLog`.

---

## Developer 2 (Engineer B) — NLP Intelligence, Analytics & Command Center

> **Domain**: Disaster signal categorization, noise suppression, query & analytics APIs, live operational metrics, and the interactive Calgary flood map.
> **Git Branch**: `feat/eng-b-nlp-dashboard`

### Checklist

- [ ] **Task B1: Calibrate NLP Disaster Classifier**
  - **Files**: `lib/nlp-classifier.ts`
  - **Action**:
    - Refine keywords and regex rules across all 7 categories:
      - `RESCUE` (Critical): `trapped`, `drowning`, `submerged`, `need boat`, `911`, `emergency`.
      - `EVACUATION` (High): `mandatory evacuation`, `evacuate`, `reception centre`, `displaced`, `shelter`.
      - `INFRASTRUCTURE` (High): `power outage`, `enmax`, `blackout`, `transformer`, `bridge closed`, `road closed`, `sewer`, `boil water`.
      - `VOLUNTEER` (Medium): `#yychelps`, `cleanup crew`, `shovels`, `mudding out`, `volunteers needed`.
      - `AID` (Medium): `food donation`, `clothing`, `blankets`, `calgary food bank`, `red cross donation`.
      - `ADVISORY` (Low): `city of calgary`, `mayor nenshi`, `press conference`, `police report`.
      - `NOISE` (None): Filter synthetic Star Wars excerpts (`"Jedi Master"`, `"blaster pistols"`, `"Yuuzhan Vong"`), Canada Day chatter (`#canadaday`, `#july1st`), and unrelated sports/banter.
  - **Done Criteria**: `classifyCrisisTweet(text)` returns category, urgency, confidence score, and matched keywords.

- [ ] **Task B2: Complete Filterable Tweets API**
  - **Files**: `app/api/tweets/route.ts`
  - **Action**:
    - Implement query filters: `?category=`, `?urgency=`, `?location=`, `?status=`, `?q=` (case-insensitive substring search), `?page=`, `?limit=`.
    - Return structured JSON: `{ tweets: [...], pagination: { page, limit, total, totalPages } }`.
    - Add sort orders: prioritize `urgency: "asc"` (`CRITICAL` first) then `createdAt: "desc"`.
  - **Done Criteria**: `GET /api/tweets?urgency=CRITICAL&location=Mission` returns only matching records.

- [ ] **Task B3: Build Real-Time Analytics API**
  - **Files**: `app/api/stats/route.ts`
  - **Action**:
    - Run fast SQL aggregations with `prisma.crisisTweet.count()` and `prisma.crisisTweet.groupBy()`.
    - Return urgency counts (Critical, High, Medium, Low).
    - Return category breakdown array.
    - Return top 10 impacted locations sorted by tweet count.
    - Return triage completion percentage (reviewed vs. unreviewed).
  - **Done Criteria**: `GET /api/stats` responds in < 50ms with complete KPI aggregations.

- [ ] **Task B4: Build Executive Command Center Dashboard**
  - **Files**: `app/page.tsx` & `components/dashboard/*`
  - **Action**:
    - **KPI Row**: 4 cards showing Critical Rescues, Infrastructure Alerts, Volunteer Offers, and Total Dataset.
    - **Category Distribution**: Visual breakdown bars showing proportions of Rescue vs. Infrastructure vs. Volunteer signals.
    - **Live Signal Feed**: Interactive stream with urgency color coding, search bar, and category chips.
    - **Data Ingestion Trigger**: A "Load 8,026 Tweets" button calling `/api/ingest` with progress state.
  - **Done Criteria**: Dashboard renders real-time counts from the database and updates upon filter change.

- [ ] **Task B5: Interactive Calgary Geospatial Flood Map**
  - **Files**: `app/map/page.tsx` & `components/dashboard/calgary-map.tsx`
  - **Action**:
    - Build an interactive map centered on Calgary (51.0447° N, 114.0719° W).
    - Plot pins for all recognized flood communities (Mission, Bowness, Sunnyside, Beltline, High River, Saddledome).
    - Color-code markers by dominant urgency (Red for Critical, Amber for Infrastructure, Green for Volunteer).
    - Clicking a marker filters the tweets to show signals originating from that neighbourhood.
  - **Done Criteria**: Map visualizes affected zones and allows spatial filtering of crisis signals.

---

## Integration Milestones (Sync Schedule)

| Milestone | Prerequisite | Description | Done Criteria |
|---|---|---|---|
| **M1: Ingestion Sync** | Tasks A1, A2, B1 | Dev 1 parser + Dev 2 classifier | `POST /api/ingest` seeds all 8,026 tweets with categorized labels |
| **M2: API Sync** | Tasks A3, A4, B2, B3 | Dev 1 Triage API + Dev 2 Stats/Tweets API | All 4 API route handlers return verified JSON from database |
| **M3: UI Sync** | Tasks A5, B4, B5 | Dashboard (`/`), Triage Queue (`/triage`), and Map (`/map`) connected | Triaging a tweet in `/triage` updates stats in `/` immediately |
| **M4: Polish & Review** | Milestone 3 complete | Edge case handling, type checking, demo preparation | `bun run typecheck` passes with 0 errors, smooth live demo |

---

## Development Commands Reference

```bash
# Start Dockerized PostgreSQL
bun run docker:up

# Stop Dockerized PostgreSQL
bun run docker:down

# Push schema changes to database
bun run db:push

# Open Prisma Studio GUI
bun run db:studio

# Start Next.js development server
bun dev

# Run strict TypeScript verification
bun run typecheck

# Build for production
bun run build
```
