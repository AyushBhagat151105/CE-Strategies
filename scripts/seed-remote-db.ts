import { PrismaClient } from "@prisma/client";
import { parseCrisisDataset } from "../lib/csv-parser";
import { CALGARY_FLOOD_ZONES } from "../lib/calgary-gazetteer";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres.y6uro1olsfs7:BHTiqWwvrSVu0RmPS6OSNq7v6bUdsPhr@db.ajaypatel.ca:5432/postgres";

console.log("=================================================");
console.log("    SEEDING PRODUCTION CLOUD DATABASE (POSTGRES) ");
console.log("=================================================");
console.log(`Target: ${databaseUrl.replace(/:[^:@]+@/, ":****@")}\n`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function seed() {
  const startTime = Date.now();

  // 1. Verify connection
  console.log("[1] Testing connection to remote database...");
  await prisma.$connect();
  console.log("  ✓ Successfully connected to database");

  // 2. Seed LocationGazetteer
  console.log("\n[2] Seeding Calgary Flood Zones gazetteer...");
  let gazetteerCount = 0;
  for (const zone of CALGARY_FLOOD_ZONES) {
    await prisma.locationGazetteer.upsert({
      where: { name: zone.name },
      update: {
        latitude: zone.coordinates.latitude,
        longitude: zone.coordinates.longitude,
        zoneType: zone.zoneType,
        floodRiskLevel: zone.riskLevel,
      },
      create: {
        name: zone.name,
        normalizedName: zone.name.toLowerCase(),
        latitude: zone.coordinates.latitude,
        longitude: zone.coordinates.longitude,
        zoneType: zone.zoneType,
        floodRiskLevel: zone.riskLevel,
      },
    });
    gazetteerCount++;
  }
  console.log(`  ✓ Upserted ${gazetteerCount} Calgary flood zones`);

  // 3. Check existing tweets count
  const existingCount = await prisma.crisisTweet.count();
  console.log(`\n[3] Current crisis tweets in database: ${existingCount}`);

  if (existingCount >= 8025) {
    console.log("  ✓ Database already contains complete dataset (8,025+ rows). Skipping raw insertion.");
  } else {
    console.log("  Seeding all 8,026 disaster tweets in batches of 250...");
    let insertedTotal = 0;
    let batchNumber = 0;

    const totalProcessed = await parseCrisisDataset(undefined, async (batch) => {
      batchNumber++;
      const result = await prisma.crisisTweet.createMany({
        data: batch.map((item) => ({
          rawText: item.rawText,
          cleanText: item.cleanText,
          category: item.category,
          urgency: item.urgency,
          sentiment: item.sentiment,
          locationName: item.locationName,
          latitude: item.latitude,
          longitude: item.longitude,
          sourceRowIndex: item.rowIndex,
          status: "UNREVIEWED",
        })),
        skipDuplicates: true,
      });

      insertedTotal += result.count;
      process.stdout.write(`\r  Batch ${batchNumber}: ${insertedTotal} records inserted so far...`);
    });

    console.log(`\n  ✓ Completed streaming ingestion! Total processed: ${totalProcessed}, inserted: ${insertedTotal}`);
  }

  // 4. Verification Check
  console.log("\n[4] Running verification check on remote database...");
  const [total, critical, high, geolocated] = await Promise.all([
    prisma.crisisTweet.count(),
    prisma.crisisTweet.count({ where: { urgency: "CRITICAL" } }),
    prisma.crisisTweet.count({ where: { urgency: "HIGH" } }),
    prisma.crisisTweet.count({ where: { locationName: { not: null } } }),
  ]);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`- Total Records In Database: ${total}`);
  console.log(`- Life-Safety Critical:      ${critical}`);
  console.log(`- High/Infra Alerts:         ${high}`);
  console.log(`- Geolocated Signals:        ${geolocated}`);
  console.log(`- Total Time:                ${elapsed}s`);

  console.log("\n=================================================");
  console.log("      REMOTE DATABASE SEEDING COMPLETE!          ");
  console.log("=================================================");
}

seed()
  .catch((err) => {
    console.error("Error during remote database seeding:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
