import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { classifyCrisisTweet, cleanTweetText } from "../lib/nlp-classifier";

async function verifyClassifier() {
  const csvPath = path.join(process.cwd(), "main_contestant.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`Dataset not found at: ${csvPath}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(csvPath, { encoding: "utf8" });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const categoryCounts: Record<string, number> = {};
  const urgencyCounts: Record<string, number> = {};
  const sentimentCounts: Record<string, number> = {};

  const sampleHits: Record<string, Array<{ text: string; confidence: number; keywords: string[] }>> = {
    RESCUE: [],
    EVACUATION: [],
    INFRASTRUCTURE: [],
    VOLUNTEER: [],
    AID: [],
    ADVISORY: [],
    NOISE: [],
  };

  let totalRows = 0;
  let isFirstLine = true;
  const startTime = performance.now();

  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) continue;

    totalRows++;
    let tweetText = trimmed;
    if (tweetText.startsWith('"') && tweetText.endsWith('"')) {
      tweetText = tweetText.slice(1, -1).replace(/""/g, '"');
    }

    const res = classifyCrisisTweet(tweetText);

    categoryCounts[res.category] = (categoryCounts[res.category] ?? 0) + 1;
    urgencyCounts[res.urgency] = (urgencyCounts[res.urgency] ?? 0) + 1;
    if (res.sentiment) {
      sentimentCounts[res.sentiment] = (sentimentCounts[res.sentiment] ?? 0) + 1;
    }

    if (sampleHits[res.category] && sampleHits[res.category].length < 3) {
      sampleHits[res.category].push({
        text: cleanTweetText(tweetText).slice(0, 100),
        confidence: res.confidence,
        keywords: res.matchedKeywords,
      });
    }
  }

  const durationMs = performance.now() - startTime;
  const tweetsPerSec = Math.round((totalRows / durationMs) * 1000);

  console.log("=================================================");
  console.log("       NLP DISASTER CLASSIFIER BENCHMARK         ");
  console.log("=================================================");
  console.log(`Total Rows Processed : ${totalRows.toLocaleString()}`);
  console.log(`Processing Time      : ${durationMs.toFixed(2)} ms`);
  console.log(`Throughput           : ${tweetsPerSec.toLocaleString()} tweets/sec`);
  console.log("-------------------------------------------------");

  console.log("\n--- Category Breakdown ---");
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / totalRows) * 100).toFixed(1);
    console.log(`  ${cat.padEnd(16)} : ${count.toString().padStart(5)} (${pct}%)`);
  }

  console.log("\n--- Urgency Breakdown ---");
  for (const [urg, count] of Object.entries(urgencyCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / totalRows) * 100).toFixed(1);
    console.log(`  ${urg.padEnd(16)} : ${count.toString().padStart(5)} (${pct}%)`);
  }

  console.log("\n--- Sentiment Breakdown ---");
  for (const [sent, count] of Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])) {
    const pct = ((count / totalRows) * 100).toFixed(1);
    console.log(`  ${sent.padEnd(16)} : ${count.toString().padStart(5)} (${pct}%)`);
  }

  console.log("\n--- Category Sample Detections ---");
  for (const [cat, samples] of Object.entries(sampleHits)) {
    if (samples.length > 0) {
      console.log(`\n[${cat}]`);
      for (const s of samples) {
        console.log(`  - (${s.confidence}) [${s.keywords.join(", ")}] "${s.text}..."`);
      }
    }
  }

  console.log("\n=================================================");
}

verifyClassifier().catch(console.error);
