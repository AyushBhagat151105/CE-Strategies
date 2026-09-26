import { NextResponse } from "next/server";
import { parseBonusFloodDataset } from "@/lib/bonus-csv-parser";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    let insertedCount = 0;

    const { totalRows, floodRows } = await parseBonusFloodDataset(undefined, async (batch) => {
      const result = await prisma.floodSignal.createMany({
        data: batch.map((item) => ({
          rawText: item.rawText,
          country: item.country,
          latitude: item.latitude,
          longitude: item.longitude,
          sourceRowIndex: item.rowIndex,
        })),
        skipDuplicates: true,
      });
      insertedCount += result.count;
    });

    return NextResponse.json({
      success: true,
      totalRowsProcessed: totalRows,
      floodRowsFound: floodRows,
      recordsInserted: insertedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error during bonus ingestion";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
