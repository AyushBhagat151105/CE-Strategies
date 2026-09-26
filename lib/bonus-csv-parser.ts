import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { isFloodRelated } from "./flood-classifier";
import { extractWorldRegion } from "./world-gazetteer";

export interface ParsedFloodRow {
  rowIndex: number;
  rawText: string;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function parseBonusFloodDataset(
  filePath = path.join(process.cwd(), "bonus_contestant.csv"),
  onBatch?: (batch: ParsedFloodRow[]) => Promise<void>,
  batchSize = 250
): Promise<{ totalRows: number; floodRows: number }> {
  const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let rowIndex = 0;
  let floodCount = 0;
  let isFirstLine = true;
  let batch: ParsedFloodRow[] = [];

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    rowIndex++;

    let tweetText = trimmed;
    if (tweetText.startsWith('"') && tweetText.endsWith('"')) {
      tweetText = tweetText.slice(1, -1).replace(/""/g, '"');
    }

    if (!isFloodRelated(tweetText)) continue;
    floodCount++;

    const region = extractWorldRegion(tweetText);

    batch.push({
      rowIndex,
      rawText: tweetText,
      country: region?.name ?? null,
      latitude: region?.coordinates.latitude ?? null,
      longitude: region?.coordinates.longitude ?? null,
    });

    if (batch.length >= batchSize) {
      if (onBatch) await onBatch(batch);
      batch = [];
    }
  }

  if (batch.length > 0) {
    if (onBatch) await onBatch(batch);
  }

  return { totalRows: rowIndex, floodRows: floodCount };
}
