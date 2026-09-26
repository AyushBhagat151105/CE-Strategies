export type CrisisCategory =
  | "RESCUE"
  | "EVACUATION"
  | "INFRASTRUCTURE"
  | "AID"
  | "VOLUNTEER"
  | "ADVISORY"
  | "NOISE"
  | "UNCLASSIFIED";

export type UrgencyLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "NONE";

export type TriageStatus =
  | "UNREVIEWED"
  | "TRIAGED"
  | "DISPATCHED"
  | "RESOLVED"
  | "DISMISSED";

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface CalgaryZone {
  name: string;
  aliases: string[];
  coordinates: GeoCoordinate;
  zoneType: "NEIGHBOURHOOD" | "INFRASTRUCTURE" | "RIVER" | "OUTLYING_TOWN";
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface ClassificationResult {
  category: CrisisCategory;
  urgency: UrgencyLevel;
  confidence: number;
  matchedKeywords: string[];
  sentiment?: "PANIC" | "CONCERN" | "NEUTRAL" | "HOPEFUL";
}

export interface CrisisStats {
  totalProcessed: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  categoryDistribution: Record<CrisisCategory, number>;
  topLocations: Array<{ name: string; count: number; coordinates?: GeoCoordinate }>;
  triagedPercentage: number;
}
