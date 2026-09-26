import { GET as getStats } from "../app/api/stats/route";
import { GET as getTweets } from "../app/api/tweets/route";
import { NextRequest } from "next/server";

async function testDashboardIntegration() {
  console.log("=================================================");
  console.log("    TESTING COMMAND CENTER DASHBOARD INTEGRATION ");
  console.log("=================================================");

  // 1. Test Stats API data shape consumed by CommandCenter
  console.log("\n[1] Verifying /api/stats shape for CommandCenter...");
  const statsRes = await getStats();
  const stats = await statsRes.json();

  console.log(`- Total crisis signals: ${stats.total}`);
  console.log(`- KPI Critical Rescues: ${stats.kpis.criticalRescues}`);
  console.log(`- KPI Infrastructure:   ${stats.kpis.infrastructureAlerts}`);
  console.log(`- KPI Volunteer:        ${stats.kpis.volunteerSignals}`);
  console.log(`- Categories tracked:   ${stats.categoryDistribution.length}`);
  console.log(`- Top locations:        ${stats.topLocations.length}`);

  if (
    typeof stats.total === "number" &&
    stats.kpis.criticalRescues >= 0 &&
    stats.categoryDistribution.length === 7 &&
    stats.topLocations.length === 10
  ) {
    console.log("  => PASSED /api/stats contract");
  } else {
    throw new Error("Stats contract mismatch");
  }

  // 2. Test Tweet Feed Initial Query (urgency sorted, page 1)
  console.log("\n[2] Verifying initial tweet stream query...");
  const req1 = new NextRequest(new URL("http://localhost:3000/api/tweets?page=1&limit=25&sortBy=urgency&sortOrder=asc"));
  const res1 = await getTweets(req1);
  const data1 = await res1.json();

  console.log(`- Total tweets in feed: ${data1.pagination.total}`);
  console.log(`- Returned in batch:    ${data1.tweets.length}`);
  console.log(`- Top tweet urgency:    ${data1.tweets[0]?.urgency}`);
  console.log(`- Top tweet category:   ${data1.tweets[0]?.category}`);

  if (data1.tweets.length === 25 && data1.tweets[0]?.urgency === "CRITICAL") {
    console.log("  => PASSED initial feed query (CRITICAL priority first)");
  } else {
    throw new Error("Initial feed query failed");
  }

  // 3. Test Filter Interaction: Clicking Critical Rescues KPI card
  console.log("\n[3] Testing Critical Rescues KPI click: ?category=RESCUE&urgency=CRITICAL");
  const req2 = new NextRequest(new URL("http://localhost:3000/api/tweets?category=RESCUE&urgency=CRITICAL&limit=25"));
  const res2 = await getTweets(req2);
  const data2 = await res2.json();

  console.log(`- Matching Critical Rescues: ${data2.pagination.total}`);
  if (data2.tweets.every((t: any) => t.category === "RESCUE" && t.urgency === "CRITICAL")) {
    console.log("  => PASSED KPI card filter");
  } else {
    throw new Error("KPI card filter failed");
  }

  // 4. Test Category Bar click: ?category=VOLUNTEER
  console.log("\n[4] Testing Volunteer category bar click: ?category=VOLUNTEER");
  const req3 = new NextRequest(new URL("http://localhost:3000/api/tweets?category=VOLUNTEER&limit=25"));
  const res3 = await getTweets(req3);
  const data3 = await res3.json();

  console.log(`- Matching Volunteer signals: ${data3.pagination.total}`);
  if (data3.tweets.every((t: any) => t.category === "VOLUNTEER")) {
    console.log("  => PASSED Category bar filter");
  } else {
    throw new Error("Category bar filter failed");
  }

  // 5. Test Impacted Zone chip click: ?location=Mission
  console.log("\n[5] Testing Impacted Zone chip click: ?location=Mission");
  const req4 = new NextRequest(new URL("http://localhost:3000/api/tweets?location=Mission&limit=25"));
  const res4 = await getTweets(req4);
  const data4 = await res4.json();

  console.log(`- Matching Mission signals: ${data4.pagination.total}`);
  if (data4.tweets.every((t: any) => t.locationName === "Mission")) {
    console.log("  => PASSED Location chip filter");
  } else {
    throw new Error("Location chip filter failed");
  }

  // 6. Test Free-text search in Feed: ?q=enmax
  console.log("\n[6] Testing Search input in Feed: ?q=enmax");
  const req5 = new NextRequest(new URL("http://localhost:3000/api/tweets?q=enmax&limit=10"));
  const res5 = await getTweets(req5);
  const data5 = await res5.json();

  console.log(`- Matching enmax signals: ${data5.pagination.total}`);
  if (data5.tweets.length > 0) {
    console.log("  => PASSED Free-text search");
  } else {
    throw new Error("Search filter failed");
  }

  console.log("\n=================================================");
  console.log("      ALL DASHBOARD INTEGRATION TESTS PASSED     ");
  console.log("=================================================");
  process.exit(0);
}

testDashboardIntegration().catch((err) => {
  console.error("Dashboard integration test failed:", err);
  process.exit(1);
});
