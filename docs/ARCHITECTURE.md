# System Architecture & Technical Specifications

## 1. System Overview

The **CE Strategies Crisis Response Informatics Platform** is a real-time crisis situational awareness application designed to ingest, classify, geolocate, and triage emergency social media feeds during natural disasters. The system is specifically calibrated for the 2013 Calgary/Alberta flood dataset (`main_contestant.csv`).

```
                              ┌─────────────────────────┐
                              │   main_contestant.csv   │
                              │     (8,026 Tweets)      │
                              └────────────┬────────────┘
                                           │
                                           ▼
                               ┌───────────────────────┐
                               │   Stream CSV Parser   │
                               │  (lib/csv-parser.ts)  │
                               └───────────┬───────────┘
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
      ┌───────────────────────┐                         ┌───────────────────────┐
      │  NLP Triage Engine    │                         │  Calgary Gazetteer    │
      │ (lib/nlp-classifier)  │                         │(lib/calgary-gazetteer)│
      └───────────┬───────────┘                         └───────────┬───────────┘
                  │                                                 │
                  └────────────────────────┬────────────────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │  PostgreSQL (Docker)    │
                              │  via Prisma ORM Client  │
                              └────────────┬────────────┘
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
     ┌───────────────────────┐                           ┌───────────────────────┐
     │   Next.js API Layer   │                           │ Next.js App Router    │
     │  - /api/ingest (POST) │                           │  - Command Center (/) │
     │  - /api/tweets (GET)  │                           │  - Triage Queue (/triage)
     │  - /api/stats (GET)   │                           │  - Flood Map (/map)   │
     │  - /api/triage(PATCH) │                           │                       │
     └───────────────────────┘                           └───────────────────────┘
```

---

## 2. Database Schema (`prisma/schema.prisma`)

The persistence layer uses PostgreSQL 16 hosted in a Docker container and accessed through Prisma.

### Data Models
1. **`CrisisTweet`**:
   - `id`: Unique identifier (`cuid()`).
   - `rawText`: Unmodified tweet text from source dataset.
   - `cleanText`: Text with URLs, surplus whitespace, and noise stripped.
   - `category`: `RESCUE` | `EVACUATION` | `INFRASTRUCTURE` | `AID` | `VOLUNTEER` | `ADVISORY` | `NOISE` | `UNCLASSIFIED`.
   - `urgency`: `CRITICAL` | `HIGH` | `MEDIUM` | `LOW` | `NONE`.
   - `locationName`: Resolved Calgary community (e.g. "Mission", "Bowness").
   - `latitude` / `longitude`: Coordinates resolved via the gazetteer.
   - `status`: `UNREVIEWED` | `TRIAGED` | `DISPATCHED` | `RESOLVED` | `DISMISSED`.
   - `isVerified`: Boolean flag set by emergency operators.
   - `sourceRowIndex`: 1-based index from `main_contestant.csv`.

2. **`TriageLog`**:
   - Tracks audit history for every status change, urgency escalation, or operator note.
   - Foreign key relationship to `CrisisTweet` with cascade delete.

3. **`LocationGazetteer`**:
   - Master reference list of Calgary flood zones, boundary risk levels, and coordinates.

4. **`AidRequest`**:
   - Structured ledger for matching volunteer offers with civilian needs (pumps, food, labour).

---

## 3. NLP Triage Engine (`lib/nlp-classifier.ts`)

The classifier operates deterministically with zero external API latency, using an urgency-first evaluation cascade:

1. **Noise Suppression**:
   - Detects synthetic inserts (e.g. Star Wars novel excerpts in the benchmark dataset like "Jedi Master", "blaster pistols", "Yuuzhan Vong") and conversational chatter.
   - Tags as `category: NOISE`, `urgency: NONE`.

2. **Life Safety & Rescue (`CRITICAL`)**:
   - Triggers on indicators of trapped persons, drowning risk, or emergency calls (`trapped`, `submerged`, `need boat`, `911`, `drowning`).

3. **Evacuation & Displacement (`HIGH`)**:
   - Triggers on mandatory evacuation notices, reception centers, and displaced residents (`evacuate`, `reception centre`, `evacuees`, `shelter`).

4. **Infrastructure & Utilities (`HIGH`)**:
   - Triggers on utility outages, structural failures, and transportation hazards (`power outage`, `ENMAX`, `transformer`, `bridge closed`, `sewer backup`, `boil water`).

5. **Volunteer Coordination (`MEDIUM`)**:
   - Triggers on grassroots recovery tags and cleanup crew calls (`#yychelps`, `cleanup`, `shovels`, `mudding out`).

6. **Donations & Aid (`MEDIUM`)**:
   - Triggers on relief supplies, food bank collections, and financial aid (`food donation`, `red cross donation`, `blankets`).

7. **Official Advisories (`LOW`)**:
   - Triggers on municipal announcements from City of Calgary, Mayor Nenshi, or Alberta Emergency Management.

---

## 4. Geospatial Gazetteer (`lib/calgary-gazetteer.ts`)

Calgary communities along the Bow and Elbow river basins experienced differentiated impacts. The gazetteer maintains canonical coordinates:

| Community / Landmark | Latitude | Longitude | Basin / Risk Zone |
|---|---|---|---|
| Mission | 51.0345 | -114.0722 | Elbow River Basin (Severe) |
| Cliff Bungalow | 51.0361 | -114.0811 | Elbow River Valley |
| Beltline | 51.0401 | -114.0719 | Urban Core / Power Grid |
| Bowness | 51.0886 | -114.2145 | Bow River West (Severe) |
| Sunnyside | 51.0560 | -114.0792 | Bow River Inner North |
| Inglewood | 51.0423 | -114.0321 | Bow / Elbow Confluence |
| Victoria Park | 51.0387 | -114.0573 | Stampede District |
| Scotiabank Saddledome | 51.0375 | -114.0519 | Submerged Event Facility |
| Rideau / Roxboro | 51.0267 | -114.0722 | Elbow River Southern Bend |
| High River | 50.5804 | -113.8744 | Outlying Town (Evacuated) |

---

## 5. API Layer Specifications

All endpoints use Next.js native Route Handlers and return standard JSON payloads:

### `POST /api/ingest`
- Triggers streamed CSV parsing of `main_contestant.csv`.
- Batches database insertions in groups of 250 using `prisma.crisisTweet.createMany`.
- Returns `{ success: true, totalRowsProcessed: number, recordsInserted: number }`.

### `GET /api/tweets`
- Query parameters:
  - `category`: Filter by category or `ALL`.
  - `urgency`: Filter by urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) or `ALL`.
  - `location`: Filter by resolved Calgary community name.
  - `status`: Filter by triage status (`UNREVIEWED`, `TRIAGED`, etc.).
  - `q`: Free-text search string on tweet content.
  - `page` (default 1) & `limit` (default 25, max 100).
- Returns paginated list of tweets with total count and page metadata.

### `GET /api/stats`
- Computes aggregate counts:
  - Urgency distribution breakdown.
  - Category frequency counts.
  - Top 10 affected locations ranked by signal density.
  - Ratio of reviewed to unreviewed signals.

### `PATCH /api/triage`
- Body: `{ tweetId: string, status?: string, urgency?: string, isVerified?: boolean, notes?: string, operatorName?: string }`.
- Executes atomic transaction: updates tweet and logs an entry in `TriageLog`.
