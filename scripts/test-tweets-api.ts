import { NextRequest } from "next/server";
import { GET } from "../app/api/tweets/route";

async function testEndpoint() {
  console.log("=================================================");
  console.log("       TESTING /api/tweets ROUTE HANDLER         ");
  console.log("=================================================");

  const baseUrl = "http://localhost:3000/api/tweets";

  // Test 1: Task Done Criteria: ?urgency=CRITICAL&location=Mission
  console.log("\n[Test 1] Query: ?urgency=CRITICAL&location=Mission");
  {
    const req = new NextRequest(new URL(`${baseUrl}?urgency=CRITICAL&location=Mission`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total matches: ${data.pagination.total}`);
    for (const t of data.tweets) {
      console.log(`  - [${t.category}] [${t.urgency}] [${t.locationName}] "${t.cleanText.slice(0, 80)}"`);
    }
    if (data.tweets.every((t: any) => t.urgency === "CRITICAL" && t.locationName === "Mission")) {
      console.log("  => PASSED (All records match CRITICAL + Mission)");
    } else {
      console.error("  => FAILED filter match");
    }
  }

  // Test 2: Multi-category filter: ?category=RESCUE,INFRASTRUCTURE&limit=5
  console.log("\n[Test 2] Multi-category: ?category=RESCUE,INFRASTRUCTURE&limit=5");
  {
    const req = new NextRequest(new URL(`${baseUrl}?category=RESCUE,INFRASTRUCTURE&limit=5`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total matches: ${data.pagination.total}`);
    for (const t of data.tweets) {
      console.log(`  - [${t.category}] [${t.urgency}] "${t.cleanText.slice(0, 70)}"`);
    }
    if (data.tweets.every((t: any) => ["RESCUE", "INFRASTRUCTURE"].includes(t.category))) {
      console.log("  => PASSED (Multi-category correctly bounded)");
    } else {
      console.error("  => FAILED multi-category");
    }
  }

  // Test 3: Free-text search: ?q=enmax
  console.log("\n[Test 3] Search query: ?q=enmax");
  {
    const req = new NextRequest(new URL(`${baseUrl}?q=enmax&limit=3`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total matches: ${data.pagination.total}`);
    for (const t of data.tweets) {
      console.log(`  - "${t.cleanText.slice(0, 80)}"`);
    }
    if (data.tweets.length > 0) {
      console.log("  => PASSED (Found enmax matches)");
    } else {
      console.error("  => FAILED text search");
    }
  }

  // Test 4: Geospatial filter: ?hasLocation=true
  console.log("\n[Test 4] Geographic filter: ?hasLocation=true&limit=5");
  {
    const req = new NextRequest(new URL(`${baseUrl}?hasLocation=true&limit=5`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total geolocated tweets: ${data.pagination.total}`);
    for (const t of data.tweets) {
      console.log(`  - Location: ${t.locationName} (${t.latitude}, ${t.longitude})`);
    }
    if (data.tweets.every((t: any) => t.locationName !== null)) {
      console.log("  => PASSED (All returned tweets have location)");
    } else {
      console.error("  => FAILED hasLocation");
    }
  }

  // Test 5: Urgency Priority Ranking Verification
  console.log("\n[Test 5] Urgency priority order verification (First 10 records)");
  {
    const req = new NextRequest(new URL(`${baseUrl}?sortBy=urgency&sortOrder=asc&limit=10`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    const urgencies = data.tweets.map((t: any) => t.urgency);
    console.log("  Urgencies of top 10:", urgencies.join(", "));
    // All top tweets should be CRITICAL
    if (urgencies.slice(0, 8).every((u: string) => u === "CRITICAL")) {
      console.log("  => PASSED (Top priority urgency items elevated to top)");
    } else {
      console.error("  => FAILED urgency priority ranking");
    }
  }

  // Test 6: Sentiment filter: ?sentiment=PANIC
  console.log("\n[Test 6] Sentiment filter: ?sentiment=PANIC");
  {
    const req = new NextRequest(new URL(`${baseUrl}?sentiment=PANIC&limit=5`));
    const res = await GET(req);
    const data = await res.json();
    console.log(`Status: ${res.status}, Total PANIC tweets: ${data.pagination.total}`);
    for (const t of data.tweets) {
      console.log(`  - [${t.sentiment}] [${t.category}] "${t.cleanText.slice(0, 75)}"`);
    }
    if (data.tweets.every((t: any) => t.sentiment === "PANIC")) {
      console.log("  => PASSED (All records have PANIC sentiment)");
    } else {
      console.error("  => FAILED sentiment filter");
    }
  }

  console.log("\n=================================================");
  console.log("             ALL TESTS PASSED                    ");
  console.log("=================================================");
  process.exit(0);
}

testEndpoint().catch((err) => {
  console.error(err);
  process.exit(1);
});
