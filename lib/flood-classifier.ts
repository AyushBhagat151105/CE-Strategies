const FLOOD_KEYWORDS = [
  "flood",
  "flooding",
  "flooded",
  "floodwater",
  "floodwaters",
  "flash flood",
  "flashflood",
  "deluge",
  "inundate",
  "inundated",
  "inundation",
  "monsoon flood",
  "monsoon rain",
  "levee",
  "dam breach",
  "dam burst",
  "dam break",
  "storm surge",
  "waterlogged",
  "water logging",
  "submerged",
  "rising floodwaters",
  "rising water level",
  "flood warning",
  "flood watch",
  "flood alert",
  "flood relief",
  "flood victims",
  "flood evacuees",
  "flood disaster",
  "burst its banks",
  "overflowed its banks",
  "riverbank overflow",
  "tsunami",
  "high water",
  "swept away by",
];

// "Flood of support/tears/etc." is figurative, not a literal disaster — exclude
// unless the tweet also carries a genuine flood-context word alongside it.
const FIGURATIVE_FLOOD_OF = /\bfloods? of (support|love|memories|tears|messages|compliments|emotions?|calls|requests|comments|applications|complaints|criticism|abuse|hate)\b/i;
const GENUINE_CONTEXT = /\b(rain|water|river|evacuat|disaster|warning|damage|rescue|home|street|road|village|town|city)\b/i;

export function isFloodRelated(rawText: string): boolean {
  const text = rawText.toLowerCase();

  const hasFloodKeyword = FLOOD_KEYWORDS.some((kw) => text.includes(kw));
  if (!hasFloodKeyword) return false;

  if (FIGURATIVE_FLOOD_OF.test(text) && !GENUINE_CONTEXT.test(text)) {
    return false;
  }

  return true;
}
