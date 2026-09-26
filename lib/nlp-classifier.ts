import type { ClassificationResult, CrisisCategory, UrgencyLevel } from "./types";

interface RuleGroup {
  category: CrisisCategory;
  urgency: UrgencyLevel;
  keywords: string[];
  patterns: RegExp[];
}

const DISASTER_RULES: RuleGroup[] = [
  {
    category: "RESCUE",
    urgency: "CRITICAL",
    keywords: [
      "trapped",
      "drowning",
      "need boat",
      "rescue us",
      "911",
      "submerged",
      "life threatening",
      "stranded on roof",
      "rising fast",
    ],
    patterns: [
      /\b(need|send)\s+(a\s+)?(boat|helicopter|rescue|help)\b/i,
      /\b(trapped|stranded)\s+(in|on|at)\b/i,
    ],
  },
  {
    category: "EVACUATION",
    urgency: "HIGH",
    keywords: [
      "evacuate",
      "mandatory evacuation",
      "evacuation order",
      "displaced",
      "evacuees",
      "reception centre",
      "shelter",
      "leaving home",
    ],
    patterns: [
      /\bevacuat(e|ed|ion|ing)\b/i,
      /\b(order(ed)?\s+to\s+leave|fleeing)\b/i,
    ],
  },
  {
    category: "INFRASTRUCTURE",
    urgency: "HIGH",
    keywords: [
      "power outage",
      "enmax",
      "blackout",
      "transformer",
      "bridge closed",
      "road closed",
      "substation",
      "sewer backup",
      "boil water",
      "gas leak",
    ],
    patterns: [
      /\b(power|water|gas|electricity)\s+(is\s+)?(out|cut|shut off|restored)\b/i,
      /\b(bridge|road|street|highway)\s+(is\s+)?(closed|impassable|collapsed|washed out)\b/i,
    ],
  },
  {
    category: "VOLUNTEER",
    urgency: "MEDIUM",
    keywords: [
      "#yychelps",
      "volunteer",
      "volunteers",
      "cleanup crew",
      "mudding out",
      "shovels",
      "helping hands",
      "project clean up",
    ],
    patterns: [
      /\bneed\s+volunteers\b/i,
      /\bready\s+to\s+(help|clean)\b/i,
    ],
  },
  {
    category: "AID",
    urgency: "MEDIUM",
    keywords: [
      "food donation",
      "red cross donation",
      "supplies",
      "blankets",
      "calgary food bank",
      "diapers",
      "hot meals",
      "donation drop",
    ],
    patterns: [
      /\bdonat(e|ion|ing)\b/i,
      /\b(supplies|food|clothing)\s+needed\b/i,
    ],
  },
  {
    category: "ADVISORY",
    urgency: "LOW",
    keywords: [
      "officials say",
      "press conference",
      "mayor nenshi",
      "city of calgary",
      "alberta emergency",
      "update from",
      "press release",
    ],
    patterns: [
      /\b(city\s+of\s+calgary|officials)\s+(state|announce|urge|warn)\b/i,
    ],
  },
];

const NOISE_INDICATORS = [
  "jaina",
  "yuuzhan vong",
  "jedi master",
  "blaster pistols",
  "corellian",
  "ahri",
  "happy canada day",
  "camping tomorrow",
];

export function classifyCrisisTweet(rawText: string): ClassificationResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Noise detection (Star Wars quotes & unrelated banter common in dataset)
  for (const marker of NOISE_INDICATORS) {
    if (lower.includes(marker)) {
      return {
        category: "NOISE",
        urgency: "NONE",
        confidence: 0.95,
        matchedKeywords: [marker],
      };
    }
  }

  // Evaluate crisis rule categories in order of urgency
  for (const rule of DISASTER_RULES) {
    const matched: string[] = [];

    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        matched.push(kw);
      }
    }

    for (const pattern of rule.patterns) {
      if (pattern.test(lower)) {
        matched.push(pattern.source);
      }
    }

    if (matched.length > 0) {
      return {
        category: rule.category,
        urgency: rule.urgency,
        confidence: Math.min(0.5 + matched.length * 0.2, 0.98),
        matchedKeywords: matched,
      };
    }
  }

  // General flood chatter fallback
  if (lower.includes("flood") || lower.includes("yyc") || lower.includes("water")) {
    return {
      category: "ADVISORY",
      urgency: "LOW",
      confidence: 0.45,
      matchedKeywords: ["flood_mention"],
    };
  }

  return {
    category: "NOISE",
    urgency: "NONE",
    confidence: 0.8,
    matchedKeywords: [],
  };
}
