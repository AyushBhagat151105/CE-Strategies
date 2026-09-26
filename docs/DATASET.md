# Crisis Dataset Specification & Domain Reference

## 1. Disaster Context: The 2013 Alberta / Calgary Floods

In late June 2013, southern Alberta experienced catastrophic flooding triggered by torrential rainfall coinciding with rapid mountain snowpack melt. Over 100,000 residents were displaced across the province, with the City of Calgary declaring a municipal State of Emergency on June 20, 2013. The Bow and Elbow rivers overflowed, inundating downtown Calgary, Mission, Beltline, Sunnyside, Bowness, and surrounding communities like High River.

During this crisis, Twitter became the primary real-time communication channel:
- Official updates used hashtags `#yycflood` and `#abflood`.
- Grassroots citizen assistance coalesced around the `#yychelps` hashtag.

---

## 2. Dataset Overview (`main_contestant.csv`)

- **File**: `main_contestant.csv`
- **Total Records**: 8,026 rows
- **Schema**: Single CSV header `tweet`, containing raw microblog posts collected during and immediately following the flood.

### Characteristic Distribution
The dataset contains a realistic mix of crisis signals, official advisories, volunteer mobilization, and noise:

1. **Life Safety & Urgent Rescue (~3-5%)**:
   - Civilians calling for boat rescues, stranded on rooftops, or reporting submerged structures.
   - *Example*: `"Officials in #Calgary say evacuations will not end until water recedes; up to 30,000 still without power #abflood"`

2. **Utility & Infrastructure Outages (~10-15%)**:
   - Power transformer failures, water boil orders, bridge closures (e.g., Peace Bridge, Centre Street Bridge), and road blockages.
   - *Example*: `"It is estimated that power will be restored to Mission, Cliff Bungalow, Beltline and Victoria Park by 10:00 PM today. #yycflood"`

3. **Volunteer Mobilization & Cleanup (~15-20%)**:
   - Grassroots efforts coordinating shovels, pumps, mud removal ("mudding out"), and food drops.
   - *Example*: `"RT @redcrosscanada: We are looking for volunteers to help following south Alberta floods. Please register at: ... #yyc"`
   - *Example*: `"Project clean up yyc is a go! #volunteer #yycflood"`

4. **Relief Aid & Financial Donations (~10-15%)**:
   - Corporate matching, food bank supply requests, Red Cross donation drives.
   - *Example*: `"Donate to @redcrosscanada to help w/ #abflood relief efforts. #Cenovus staff, we'll match employee donations"`

5. **Official Advisories & News Updates (~15-20%)**:
   - Statements from Mayor Naheed Nenshi, Calgary Police Service, ENMAX, and municipal emergency officials.

6. **Conversational Chatter & Benchmark Noise (~30-35%)**:
   - General banter, personal feelings, Canada Day celebrations (`#canadaday`, `#july1st`).
   - Synthetic noise text inserted in benchmark evaluation sets (e.g. Star Wars Expanded Universe book snippets like `"Jaina had seen that much as she maneuvered the wounded Jedi Master aboard her ship"`, `"snapping his tail spike outward in menacing fa"`).

---

## 3. Triage Category & Urgency Matrix

| Category | Urgency Level | Defining Keywords & Triggers | Operational Response |
|---|---|---|---|
| **RESCUE** | `CRITICAL` | `trapped`, `submerged`, `911`, `drowning`, `need boat`, `rescue us` | Immediate dispatch of first responders / water rescue |
| **EVACUATION** | `HIGH` | `mandatory evacuation`, `evacuate`, `evacuation order`, `reception centre`, `shelter` | Direct evacuees to active reception facilities |
| **INFRASTRUCTURE** | `HIGH` | `power outage`, `enmax`, `blackout`, `transformer`, `bridge closed`, `road closed`, `boil water` | Notify municipal utility & transportation crews |
| **VOLUNTEER** | `MEDIUM` | `#yychelps`, `volunteer`, `cleanup`, `mudding out`, `shovels`, `helping hands` | Coordinate with citizen volunteer hubs |
| **AID** | `MEDIUM` | `food donation`, `clothing`, `blankets`, `calgary food bank`, `supplies needed` | Route to logistics centers and charity drop-offs |
| **ADVISORY** | `LOW` | `officials say`, `press conference`, `mayor nenshi`, `city of calgary`, `police report` | Catalog for situational awareness feed |
| **NOISE** | `NONE` | Book quotes, off-topic chat, sports commentary, spam | Filter out to reduce operator cognitive load |

---

## 4. Calgary Flood Zone Gazetteer

The gazetteer maps text references in tweets to latitude/longitude coordinates:

| Community Name | Latitude | Longitude | Primary Hazards |
|---|---|---|---|
| **Mission** | 51.0345 | -114.0722 | Severe Elbow River flooding, complete power loss |
| **Cliff Bungalow** | 51.0361 | -114.0811 | Residential basement flooding |
| **Beltline** | 51.0401 | -114.0719 | Electrical grid substation shutdowns |
| **Bowness** | 51.0886 | -114.2145 | Severe Bow River overflow, home inundation |
| **Sunnyside** | 51.0560 | -114.0792 | Storm sewer backflow from Bow River |
| **Inglewood** | 51.0423 | -114.0321 | Confluence flooding, bridge closures |
| **Victoria Park** | 51.0387 | -114.0573 | Submerged roadway corridors |
| **Saddledome** | 51.0375 | -114.0519 | Arena flooded up to row 8 of seating |
| **High River** | 50.5804 | -113.8744 | Entire town inundated; total evacuation |
| **Downtown Core** | 51.0461 | -114.0654 | High-rise basement flooding, power blackouts |
