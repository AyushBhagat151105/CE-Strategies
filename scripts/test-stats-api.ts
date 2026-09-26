import { GET } from "../app/api/stats/route";

async function testStatsApi() {
  console.log("=================================================");
  console.log("       TESTING /api/stats ROUTE HANDLER          ");
  console.log("=================================================");

  // 1. Warm-up call
  await GET();

  // 2. Measure latency across multiple runs
  const iterations = 10;
  const latencies: number[] = [];

  let lastData: any = null;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const res = await GET();
    const duration = performance.now() - start;
    latencies.push(duration);

    if (res.status !== 200) {
      throw new Error(`Unexpected status ${res.status}`);
    }

    if (i === iterations - 1) {
      lastData = await res.json();
    }
  }

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  console.log(`\nLatency across ${iterations} calls:`);
  console.log(`  - Average: ${avgLatency.toFixed(2)} ms (Criteria: < 50ms)`);
  console.log(`  - Min:     ${minLatency.toFixed(2)} ms`);
  console.log(`  - Max:     ${maxLatency.toFixed(2)} ms`);

  if (avgLatency < 50) {
    console.log("  => PASSED latency criteria (< 50ms)");
  } else {
    console.error("  => FAILED latency criteria");
  }

  // 3. Verify Response Payload Fields
  console.log("\n[Payload Verification]");
  console.log(`Total records: ${lastData.total}`);

  console.log("\nUrgency breakdown:");
  console.table(lastData.urgency);

  console.log("\nTriage status:");
  console.table(lastData.triageStatus);

  console.log("\nSentiment breakdown:");
  console.table(lastData.sentiment);

  console.log("\nGeospatial metrics:");
  console.table(lastData.geospatial);

  console.log("\nKPI summary:");
  console.table(lastData.kpis);

  console.log("\nCategory Distribution:");
  for (const cat of lastData.categoryDistribution) {
    console.log(`  - ${cat.category.padEnd(16)}: ${cat.count.toString().padStart(5)} (${cat.percentage.toFixed(1)}%)`);
  }

  console.log("\nTop 10 Impacted Locations:");
  for (const loc of lastData.topLocations) {
    const coords = loc.coordinates ? `[${loc.coordinates.latitude}, ${loc.coordinates.longitude}]` : "No coords";
    console.log(`  - ${loc.name.padEnd(18)}: ${loc.count.toString().padStart(4)} tweets  ${coords}`);
  }

  // Validations
  const urgencySum =
    lastData.urgency.critical +
    lastData.urgency.high +
    lastData.urgency.medium +
    lastData.urgency.low +
    lastData.urgency.none;

  const categorySum = lastData.categoryDistribution.reduce(
    (acc: number, c: { count: number }) => acc + c.count,
    0
  );

  console.log("\n[Integrity Checks]");
  console.log(`  Total: ${lastData.total}`);
  console.log(`  Urgency Sum: ${urgencySum} (Matches total: ${urgencySum === lastData.total})`);
  console.log(`  Category Sum: ${categorySum} (Matches total: ${categorySum === lastData.total})`);
  console.log(`  Top Locations count: ${lastData.topLocations.length} (Expected: 10)`);

  const passed =
    avgLatency < 50 &&
    urgencySum === lastData.total &&
    categorySum === lastData.total &&
    lastData.topLocations.length === 10;

  if (passed) {
    console.log("\n=================================================");
    console.log("            ALL STATS TESTS PASSED               ");
    console.log("=================================================");
    process.exit(0);
  } else {
    console.error("\nIntegrity validation failed!");
    process.exit(1);
  }
}

testStatsApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
