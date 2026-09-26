import { CALGARY_FLOOD_ZONES, extractCalgaryLocation } from "../lib/calgary-gazetteer";
import { GET as getStats } from "../app/api/stats/route";
import { GET as getTweets } from "../app/api/tweets/route";
import { NextRequest } from "next/server";

async function testMapIntegration() {
  console.log("=================================================");
  console.log("     TESTING CALGARY GEOSPATIAL MAP INTEGRATION   ");
  console.log("=================================================");

  // 1. Verify CALGARY_FLOOD_ZONES definition
  console.log("\n[1] Verifying Calgary flood zones gazetteer definitions...");
  console.log(`- Total recognized flood communities: ${CALGARY_FLOOD_ZONES.length}`);

  const requiredZones = ["Mission", "Bowness", "Sunnyside", "Beltline", "Downtown", "Saddledome", "High River", "Inglewood"];
  for (const zoneName of requiredZones) {
    const zone = CALGARY_FLOOD_ZONES.find((z) => z.name === zoneName);
    if (!zone) {
      throw new Error(`Missing expected flood zone: ${zoneName}`);
    }
    if (typeof zone.coordinates.latitude !== "number" || typeof zone.coordinates.longitude !== "number") {
      throw new Error(`Invalid coordinates for zone: ${zoneName}`);
    }
    console.log(`  ✓ ${zone.name.padEnd(12)} -> [${zone.coordinates.latitude.toFixed(4)}, ${zone.coordinates.longitude.toFixed(4)}] (${zone.riskLevel} risk)`);
  }

  // 2. Verify Stats API returns top impacted locations with coordinates
  console.log("\n[2] Verifying /api/stats returns top locations with resolved coordinates...");
  const statsRes = await getStats();
  const stats = await statsRes.json();

  if (!stats.topLocations || stats.topLocations.length === 0) {
    throw new Error("No topLocations found in /api/stats");
  }

  console.log(`- Retrieved ${stats.topLocations.length} top locations from database`);
  for (const loc of stats.topLocations.slice(0, 5)) {
    console.log(`  ✓ ${loc.name.padEnd(15)} : ${loc.count} tweets (coords: ${loc.coordinates ? `${loc.coordinates.latitude}, ${loc.coordinates.longitude}` : "none"})`);
  }

  // 3. Verify Location-based tweet queries for map click-to-filter
  console.log("\n[3] Verifying location-based tweet filtering for active map zones...");
  const testLocations = ["Mission", "Bowness", "Downtown", "High River"];

  for (const loc of testLocations) {
    const req = new NextRequest(new URL(`http://localhost:3000/api/tweets?location=${encodeURIComponent(loc)}&limit=10&sortBy=urgency&sortOrder=asc`));
    const res = await getTweets(req);
    const data = await res.json();

    console.log(`  ✓ Querying location="${loc}": ${data.pagination.total} matching records`);

    if (data.tweets.length > 0) {
      const allMatch = data.tweets.every((t: any) => t.locationName === loc);
      if (!allMatch) {
        throw new Error(`Found mismatched tweet in location query for "${loc}"`);
      }
      console.log(`    First signal [${data.tweets[0].urgency}]: "${data.tweets[0].rawText.slice(0, 60)}..."`);
    }
  }

  // 4. Test Coordinate Projection Math Boundary Checks
  console.log("\n[4] Testing coordinate projection bounding box math...");
  // Core bounding box: Lat 50.98 -> 51.12, Lng -114.22 -> -113.98
  const width = 800;
  const height = 500;
  const padding = 50;

  const minLat = 50.98;
  const maxLat = 51.12;
  const minLng = -114.22;
  const maxLng = -113.98;

  function project(lat: number, lng: number) {
    const x = padding + ((lng - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    const y = height - padding - ((lat - minLat) / (maxLat - minLat)) * (height - 2 * padding);
    return { x, y };
  }

  const mission = CALGARY_FLOOD_ZONES.find((z) => z.name === "Mission")!;
  const ptMission = project(mission.coordinates.latitude, mission.coordinates.longitude);
  console.log(`  ✓ Mission projection: x=${ptMission.x.toFixed(1)}, y=${ptMission.y.toFixed(1)} (within [0..${width}], [0..${height}])`);

  if (ptMission.x < 0 || ptMission.x > width || ptMission.y < 0 || ptMission.y > height) {
    throw new Error("Mission projection coordinates out of bounds");
  }

  console.log("\n=================================================");
  console.log("       ALL MAP INTEGRATION TESTS PASSED          ");
  console.log("=================================================");
  process.exit(0);
}

testMapIntegration().catch((err) => {
  console.error("Map integration test failed:", err);
  process.exit(1);
});
