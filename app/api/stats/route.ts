import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CALGARY_FLOOD_ZONES } from "@/lib/calgary-gazetteer";

export const dynamic = "force-dynamic";

interface MetricsRow {
  total: number;
  critical: bigint;
  high: bigint;
  medium: bigint;
  low: bigint;
  none: bigint;
  unreviewed: bigint;
  reviewed: bigint;
  verified: bigint;
  geolocated: bigint;
  panic: bigint;
  concern: bigint;
  neutral: bigint;
  hopeful: bigint;
}

interface CategoryRow {
  category: string;
  count: number;
}

interface LocationRow {
  name: string;
  count: number;
  latitude: number | null;
  longitude: number | null;
}

const zoneCoordMap = new Map(
  CALGARY_FLOOD_ZONES.map((z) => [z.name.toLowerCase(), z.coordinates])
);

export async function GET() {
  try {
    const [metricsResult, categoriesResult, locationsResult] = await Promise.all([
      prisma.$queryRaw<MetricsRow[]>`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE urgency = 'CRITICAL')::bigint AS critical,
          COUNT(*) FILTER (WHERE urgency = 'HIGH')::bigint AS high,
          COUNT(*) FILTER (WHERE urgency = 'MEDIUM')::bigint AS medium,
          COUNT(*) FILTER (WHERE urgency = 'LOW')::bigint AS low,
          COUNT(*) FILTER (WHERE urgency = 'NONE')::bigint AS none,
          COUNT(*) FILTER (WHERE status = 'UNREVIEWED')::bigint AS unreviewed,
          COUNT(*) FILTER (WHERE status != 'UNREVIEWED')::bigint AS reviewed,
          COUNT(*) FILTER (WHERE "isVerified" = true)::bigint AS verified,
          COUNT(*) FILTER (WHERE "locationName" IS NOT NULL)::bigint AS geolocated,
          COUNT(*) FILTER (WHERE sentiment = 'PANIC')::bigint AS panic,
          COUNT(*) FILTER (WHERE sentiment = 'CONCERN')::bigint AS concern,
          COUNT(*) FILTER (WHERE sentiment = 'NEUTRAL')::bigint AS neutral,
          COUNT(*) FILTER (WHERE sentiment = 'HOPEFUL')::bigint AS hopeful
        FROM "CrisisTweet"
      `,
      prisma.$queryRaw<CategoryRow[]>`
        SELECT
          category,
          COUNT(*)::int AS count
        FROM "CrisisTweet"
        GROUP BY category
        ORDER BY count DESC
      `,
      prisma.$queryRaw<LocationRow[]>`
        SELECT
          "locationName" AS name,
          COUNT(*)::int AS count,
          AVG(latitude)::float AS latitude,
          AVG(longitude)::float AS longitude
        FROM "CrisisTweet"
        WHERE "locationName" IS NOT NULL
        GROUP BY "locationName"
        ORDER BY count DESC
        LIMIT 10
      `,
    ]);

    const m = metricsResult[0] ?? {
      total: 0,
      critical: 0n,
      high: 0n,
      medium: 0n,
      low: 0n,
      none: 0n,
      unreviewed: 0n,
      reviewed: 0n,
      verified: 0n,
      geolocated: 0n,
      panic: 0n,
      concern: 0n,
      neutral: 0n,
      hopeful: 0n,
    };

    const total = Number(m.total ?? 0);
    const reviewed = Number(m.reviewed ?? 0);
    const unreviewed = Number(m.unreviewed ?? 0);
    const geolocated = Number(m.geolocated ?? 0);

    const triagedPercentage = total > 0 ? Number(((reviewed / total) * 100).toFixed(1)) : 0;
    const geolocatedPercentage = total > 0 ? Number(((geolocated / total) * 100).toFixed(1)) : 0;

    const categoryDistribution = categoriesResult.map((c) => ({
      category: c.category,
      count: Number(c.count),
      percentage: total > 0 ? Number(((Number(c.count) / total) * 100).toFixed(1)) : 0,
    }));

    const categoryMap = new Map(categoryDistribution.map((c) => [c.category, c.count]));

    const topLocations = locationsResult.map((loc) => {
      const fallback = zoneCoordMap.get(loc.name.toLowerCase());
      const lat = loc.latitude !== null ? Number(loc.latitude.toFixed(4)) : fallback?.latitude ?? null;
      const lng = loc.longitude !== null ? Number(loc.longitude.toFixed(4)) : fallback?.longitude ?? null;
      return {
        name: loc.name,
        location: loc.name,
        count: Number(loc.count),
        percentage: total > 0 ? Number(((Number(loc.count) / total) * 100).toFixed(1)) : 0,
        coordinates: lat !== null && lng !== null ? { latitude: lat, longitude: lng } : undefined,
      };
    });

    return NextResponse.json({
      total,
      urgency: {
        critical: Number(m.critical ?? 0),
        high: Number(m.high ?? 0),
        medium: Number(m.medium ?? 0),
        low: Number(m.low ?? 0),
        none: Number(m.none ?? 0),
      },
      triageStatus: {
        unreviewed,
        reviewed,
        triagedPercentage,
        verified: Number(m.verified ?? 0),
      },
      sentiment: {
        panic: Number(m.panic ?? 0),
        concern: Number(m.concern ?? 0),
        neutral: Number(m.neutral ?? 0),
        hopeful: Number(m.hopeful ?? 0),
      },
      geospatial: {
        totalGeolocated: geolocated,
        geolocatedPercentage,
      },
      categoryDistribution,
      topLocations,
      kpis: {
        criticalRescues: categoryMap.get("RESCUE") ?? Number(m.critical ?? 0),
        infrastructureAlerts: categoryMap.get("INFRASTRUCTURE") ?? 0,
        volunteerSignals: categoryMap.get("VOLUNTEER") ?? 0,
        evacuationAlerts: categoryMap.get("EVACUATION") ?? 0,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate crisis stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
