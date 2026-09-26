import type { CalgaryZone, GeoCoordinate } from "./types";

export const CALGARY_FLOOD_ZONES: readonly CalgaryZone[] = [
  {
    name: "Mission",
    aliases: ["mission", "4th street sw", "4th st sw"],
    coordinates: { latitude: 51.0345, longitude: -114.0722 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Cliff Bungalow",
    aliases: ["cliff bungalow"],
    coordinates: { latitude: 51.0361, longitude: -114.0811 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Beltline",
    aliases: ["beltline", "17th ave", "17th avenue"],
    coordinates: { latitude: 51.0401, longitude: -114.0719 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Bowness",
    aliases: ["bowness", "bowness park"],
    coordinates: { latitude: 51.0886, longitude: -114.2145 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Sunnyside",
    aliases: ["sunnyside", "kensington"],
    coordinates: { latitude: 51.056, longitude: -114.0792 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Inglewood",
    aliases: ["inglewood", "9th ave se"],
    coordinates: { latitude: 51.0423, longitude: -114.0321 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Victoria Park",
    aliases: ["victoria park", "vic park"],
    coordinates: { latitude: 51.0387, longitude: -114.0573 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Saddledome",
    aliases: ["saddledome", "scotiabank saddledome", "stampede grounds", "stampede park"],
    coordinates: { latitude: 51.0375, longitude: -114.0519 },
    zoneType: "INFRASTRUCTURE",
    riskLevel: "HIGH",
  },
  {
    name: "Downtown",
    aliases: ["downtown", "core", "stephen ave", "8th ave"],
    coordinates: { latitude: 51.0461, longitude: -114.0654 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "Rideau / Roxboro",
    aliases: ["rideau", "roxboro"],
    coordinates: { latitude: 51.0267, longitude: -114.0722 },
    zoneType: "NEIGHBOURHOOD",
    riskLevel: "HIGH",
  },
  {
    name: "High River",
    aliases: ["high river"],
    coordinates: { latitude: 50.5804, longitude: -113.8744 },
    zoneType: "OUTLYING_TOWN",
    riskLevel: "HIGH",
  },
  {
    name: "Bow River",
    aliases: ["bow river", "bow river pathway"],
    coordinates: { latitude: 51.052, longitude: -114.068 },
    zoneType: "RIVER",
    riskLevel: "HIGH",
  },
  {
    name: "Elbow River",
    aliases: ["elbow river"],
    coordinates: { latitude: 51.041, longitude: -114.049 },
    zoneType: "RIVER",
    riskLevel: "HIGH",
  },
] as const;

export function extractCalgaryLocation(text: string): {
  name: string;
  coordinates: GeoCoordinate;
} | null {
  const lower = text.toLowerCase();
  for (const zone of CALGARY_FLOOD_ZONES) {
    for (const alias of zone.aliases) {
      const pattern = new RegExp(`\\b${alias}\\b`, "i");
      if (pattern.test(lower)) {
        return {
          name: zone.name,
          coordinates: zone.coordinates,
        };
      }
    }
  }
  return null;
}
