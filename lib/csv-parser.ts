import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { classifyCrisisTweet } from "./nlp-classifier";
import { extractCalgaryLocation } from "./calgary-gazetteer";

export interface ParsedCrisisRow {
  rowIndex: number;
  rawText: string;
  category: string;
  urgency: string;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function parseCrisisDataset(
  filePath = path.join(process.cwd(), "main_contestant.csv"),
  onBatch?: (batch: ParsedCrisisRow[]) => Promise<void>,
  batchSize = 250
): Promise<number> {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let rowIndex = 0;
  let isFirstLine = true;
  let batch: ParsedCrisisRow[] = [];
  let totalProcessed = 0;

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue; // Skip CSV header ("tweet")
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    rowIndex++;

    // Unquote if wrapped in CSV quotes
    let tweetText = trimmed;
    if (tweetText.startsWith('"') && tweetText.endsWith('"')) {
      tweetText = tweetText.slice(1, -1).replace(/""/g, '"');
    }

    const classification = classifyCrisisTweet(tweetText);
    const location = extractCalgaryLocation(tweetText);

    batch.push({
      rowIndex,
      rawText: tweetText,
      category: classification.category,
      urgency: classification.urgency,
      locationName: location?.name ?? null,
      latitude: location?.coordinates.latitude ?? null,
      longitude: location?.coordinates.longitude ?? null,
    });

    if (batch.length >= batchSize) {
      if (onBatch) {
        await onBatch(batch);
      }
      totalProcessed += batch.length;
      batch = [];
    }
  }

  if (batch.length > 0) {
    if (onBatch) {
      await onBatch(batch);
    }
    totalProcessed += batch.length;
  }

  return totalProcessed;
}
