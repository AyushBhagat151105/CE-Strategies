import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [total, geolocated, countryGroups] = await Promise.all([
      prisma.floodSignal.count(),
      prisma.floodSignal.count({ where: { country: { not: null } } }),
      prisma.floodSignal.groupBy({
        by: ["country", "latitude", "longitude"],
        where: { country: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { country: "desc" } },
      }),
    ]);

    // Collapse duplicate country rows (same country can have multiple lat/lng
    // groupings if any ever diverge) into a single count per country.
    const byCountry = new Map<string, { name: string; count: number; latitude: number; longitude: number }>();
    for (const g of countryGroups) {
      if (!g.country) continue;
      const existing = byCountry.get(g.country);
      if (existing) {
        existing.count += g._count._all;
      } else {
        byCountry.set(g.country, {
          name: g.country,
          count: g._count._all,
          latitude: g.latitude ?? 0,
          longitude: g.longitude ?? 0,
        });
      }
    }

    const countries = Array.from(byCountry.values()).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      total,
      geolocated,
      geolocatedPercentage: total > 0 ? Number(((geolocated / total) * 100).toFixed(1)) : 0,
      countries,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate world flood stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
