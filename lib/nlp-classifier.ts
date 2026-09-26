import type { ClassificationResult, CrisisCategory, UrgencyLevel } from "./types";

export interface RuleGroup {
  category: CrisisCategory;
  urgency: UrgencyLevel;
  keywords: string[];
  patterns: RegExp[];
}

export const NOISE_INDICATORS: readonly string[] = [
  "jaina",
  "yuuzhan vong",
  "jedi",
  "blaster pistol",
  "blaster pistols",
  "corellian",
  "vestara",
  "coruscant",
  "skywalker",
  "lightsaber",
  "sith",
  "tie fighter",
  "abeloth",
  "massassi",
  "threepio",
  "c-3po",
  "r2-d2",
  "tapani",
  "starfighter",
  "wookiee",
  "darth",
  "force powers",
  "the force when",
  "happy canada day",
  "camping tomorrow",
  "going camping",
  "durrrr",
  "isuldur1",
];

const DISASTER_RULES: readonly RuleGroup[] = [
  {
    category: "RESCUE",
    urgency: "CRITICAL",
    keywords: [
      "drowning",
      "need boat",
      "send boat",
      "rescue us",
      "life threatening",
      "stranded on roof",
      "water rising fast",
      "send help",
      "need rescue",
      "emergency rescue",
      "water rescue",
      "underwater in house",
      "trapped in house",
      "trapped on roof",
      "trapped in water",
    ],
    patterns: [
      /\b(need|send)\s+(a\s+)?(boat|helicopter|rescue|water\s+rescue)\b/i,
      /\b(trapped|stranded)\s+(in|on|at|inside)\s+(the\s+)?(water|flood|roof|river|house|home|attic|car|vehicle|tree)\b/i,
      /\b(water|flood)\s+(is\s+)?(at\s+the\s+roof|rising\s+fast|over\s+the\s+roof)\b/i,
      /\blife\s+(or|and)\s+death\b/i,
      /\bwater\s+rescue\s+crew/i,
      /\bcall\s+911\b/i,
    ],
  },
  {
    category: "EVACUATION",
    urgency: "HIGH",
    keywords: [
      "mandatory evacuation",
      "evacuate",
      "evacuated",
      "evacuation order",
      "displaced",
      "evacuees",
      "reception centre",
      "reception center",
      "emergency shelter",
      "evacuation zone",
      "forced to leave",
      "fleeing",
      "evac center",
      "evac centre",
      "leaving home",
    ],
    patterns: [
      /\bevacuat(e|ed|ion|ing|ions)\b/i,
      /\b(order(ed)?\s+to\s+leave|fleeing\s+(homes?|area))\b/i,
      /\b(reception|evac(uation)?)\s+cent(re|er)\b/i,
      /\bpack\s+(your\s+)?bags\b/i,
    ],
  },
  {
    category: "INFRASTRUCTURE",
    urgency: "HIGH",
    keywords: [
      "power outage",
      "power out",
      "powerless",
      "no electricity",
      "no power",
      "power shut-off",
      "power cut",
      "enmax",
      "blackout",
      "transformer",
      "substation",
      "bridge closed",
      "bridge is closed",
      "bridge sinking",
      "bridge collapse",
      "road closed",
      "roads closed",
      "highway closed",
      "streets closed",
      "street closed",
      "traffic detour",
      "ctrain",
      "c-train",
      "transit shut",
      "transit closed",
      "sewer backup",
      "backed up sewer",
      "boil water",
      "gas leak",
      "gas cut-off",
      "gas shut off",
      "roads washed out",
      "washed out road",
      "flooded basement",
      "basement flooded",
      "parkade flooded",
      "boilers down",
    ],
    patterns: [
      /\b(power|water|gas|electricity|grid)\s+(is\s+)?(out|cut|shut\s*off|restored|down|issues)\b/i,
      /\b(bridge|road|street|highway|tunnel|underpass|ctrain|c-train|transit)\s+(is\s+)?(closed|impassable|collapsed|sinking|washed\s*out|shut\s*down|blocked)\b/i,
      /\b(transformer|substation)\s+(blown|fire|explosion|underwater|flooded)\b/i,
      /\b(sewer|drainage)\s+(backup|backed\s*up|overflowing)\b/i,
      /\bboil\s+water\s+(advisory|order|notice)\b/i,
      /\bno\s+(power|electricity|drinking\s+water)\b/i,
    ],
  },
  {
    category: "VOLUNTEER",
    urgency: "MEDIUM",
    keywords: [
      "#yychelps",
      "yychelps",
      "volunteer",
      "volunteers",
      "volunteers needed",
      "need volunteers",
      "cleanup crew",
      "clean up crew",
      "clean-up crew",
      "community cleanup",
      "mudding out",
      "mud out",
      "shovels",
      "sump pump",
      "bilge pump",
      "pumping out",
      "helping hands",
      "project clean up",
      "ready to help",
      "volunteer registration",
      "sandbags",
      "sandbagging",
      "sand bagging",
    ],
    patterns: [
      /\b(need|seeking|call\s+for)\s+(volunteers|help|cleanup|shovels|pumps)\b/i,
      /\b(ready|willing|happy)\s+to\s+(help|volunteer|clean|shovel|pump)\b/i,
      /\b(mudding|digging)\s+out\b/i,
      /\bclean(\s|-)?up\s+(time|effort|crew|day|work)\b/i,
      /\b#?yychelps\b/i,
    ],
  },
  {
    category: "AID",
    urgency: "MEDIUM",
    keywords: [
      "food donation",
      "red cross donation",
      "donations",
      "donated",
      "calgary food bank",
      "food bank",
      "blankets",
      "supplies needed",
      "hot meals",
      "drop-off location",
      "donation drop",
      "relief supplies",
      "animal rescue",
      "pet shelter",
      "pet foster",
      "diapers",
      "clothing donation",
      "cots",
    ],
    patterns: [
      /\bdonat(e|ion|ions|ing|ed)\b/i,
      /\b(supplies|food|clothing|water|blankets|diapers)\s+(needed|drop|collection|drive)\b/i,
      /\b(red\s+cross|food\s+bank)\b/i,
    ],
  },
  {
    category: "ADVISORY",
    urgency: "LOW",
    keywords: [
      "city of calgary",
      "mayor nenshi",
      "nenshi",
      "press conference",
      "police update",
      "calgary police",
      "alberta emergency",
      "river crest",
      "flood advisory",
      "state of emergency",
      "water levels",
      "alberta government",
      "press release",
      "flood warning",
      "high streamflow",
      "calgary emergency management",
      "cema",
    ],
    patterns: [
      /\b(city\s+of\s+calgary|officials|cema|calgary\s+police|mayor)\s+(state|announce|urge|warn|confirm|report|brief)\b/i,
      /\b(state\s+of\s+emergency|local\s+emergency)\b/i,
      /\b(river\s+levels?|cresting|peak\s+flow)\b/i,
    ],
  },
];

export function cleanTweetText(rawText: string): string {
  return rawText
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/^RT\s+@[\w_]+:?\s*/i, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function detectSentiment(text: string): "PANIC" | "CONCERN" | "NEUTRAL" | "HOPEFUL" {
  const lower = text.toLowerCase();

  // Panic: acute fear, trapped life-safety signals
  if (
    /\b(trapped|drowning|terrified|horrifying|screaming|submerged|life\s+threatening|desperate)\b/i.test(lower) ||
    (/\b(help|danger|emergency)\b/i.test(lower) && /!{2,}/.test(text))
  ) {
    return "PANIC";
  }

  // Hopeful: resilience, community gratitude, solidarity
  if (
    /\b(proud\s+of|calgary\s+strong|heroes|solidarity|thank\s+you|grateful|resilient|we\s+will\s+rebuild|helping\s+out|amazing\s+volunteers|restored)\b/i.test(lower) ||
    lower.includes("#yychelps")
  ) {
    return "HOPEFUL";
  }

  // Concern: anxiety, caution, rising waters
  if (
    /\b(worried|scared|frightened|stay\s+safe|rising\s+fast|be\s+careful|devastating|heartbreaking|sad|tragic|pray\s+for|prayers)\b/i.test(lower)
  ) {
    return "CONCERN";
  }

  return "NEUTRAL";
}

export function classifyCrisisTweet(rawText: string): ClassificationResult {
  const cleaned = cleanTweetText(rawText);
  const text = cleaned || rawText.trim();
  const lower = text.toLowerCase();

  // 1. Noise Detection: Synthetic inserts and irrelevant non-disaster chatter
  for (const marker of NOISE_INDICATORS) {
    if (lower.includes(marker)) {
      return {
        category: "NOISE",
        urgency: "NONE",
        confidence: 0.95,
        matchedKeywords: [marker],
        sentiment: "NEUTRAL",
      };
    }
  }

  // 2. Evaluate Rule Categories in Urgency Order
  for (const rule of DISASTER_RULES) {
    const matched: string[] = [];

    for (const kw of rule.keywords) {
      const kwPattern = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
      if (kwPattern.test(lower)) {
        matched.push(kw);
      }
    }

    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) {
        matched.push(pattern.source);
      }
    }

    if (matched.length > 0) {
      const baseConfidence = rule.urgency === "CRITICAL" ? 0.75 : 0.65;
      const confidence = Math.min(baseConfidence + matched.length * 0.1, 0.98);

      return {
        category: rule.category,
        urgency: rule.urgency,
        confidence: Number(confidence.toFixed(2)),
        matchedKeywords: matched,
        sentiment: detectSentiment(text),
      };
    }
  }

  // 3. Fallback for General Flood / Disaster Awareness
  const hasDisasterMention = /\b(flood|flooding|floods|submerged|overflow|underwater|high\s+water|abflood|yycflood)\b/i.test(lower);

  if (hasDisasterMention) {
    return {
      category: "ADVISORY",
      urgency: "LOW",
      confidence: 0.55,
      matchedKeywords: ["general_flood_mention"],
      sentiment: detectSentiment(text),
    };
  }

  // 4. Default Non-Crisis Noise
  return {
    category: "NOISE",
    urgency: "NONE",
    confidence: 0.8,
    matchedKeywords: [],
    sentiment: "NEUTRAL",
  };
}
