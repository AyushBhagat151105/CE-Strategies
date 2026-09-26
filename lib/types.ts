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

export interface CrisisTweetRecord {
  id: string;
  rawText: string;
  cleanText: string | null;
  category: CrisisCategory;
  urgency: UrgencyLevel;
  sentiment: "PANIC" | "CONCERN" | "NEUTRAL" | "HOPEFUL" | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  author: string | null;
  isVerified: boolean;
  status: TriageStatus;
  sourceRowIndex: number | null;
  createdAt: string;
  updatedAt: string;
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
