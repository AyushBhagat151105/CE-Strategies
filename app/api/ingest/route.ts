import { NextResponse } from "next/server";
import { parseCrisisDataset } from "@/lib/csv-parser";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    let insertedCount = 0;

    const total = await parseCrisisDataset(undefined, async (batch) => {
      const result = await prisma.crisisTweet.createMany({
        data: batch.map((item) => ({
          rawText: item.rawText,
          category: item.category,
          urgency: item.urgency,
          locationName: item.locationName,
          latitude: item.latitude,
          longitude: item.longitude,
          sourceRowIndex: item.rowIndex,
          status: "UNREVIEWED",
        })),
        skipDuplicates: true,
      });
      insertedCount += result.count;
    });

    return NextResponse.json({
      success: true,
      totalRowsProcessed: total,
      recordsInserted: insertedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during ingestion";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
