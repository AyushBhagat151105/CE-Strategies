import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [total, criticalCount, highCount, mediumCount, lowCount, unreviewedCount] =
      await Promise.all([
        prisma.crisisTweet.count(),
        prisma.crisisTweet.count({ where: { urgency: "CRITICAL" } }),
        prisma.crisisTweet.count({ where: { urgency: "HIGH" } }),
        prisma.crisisTweet.count({ where: { urgency: "MEDIUM" } }),
        prisma.crisisTweet.count({ where: { urgency: "LOW" } }),
        prisma.crisisTweet.count({ where: { status: "UNREVIEWED" } }),
      ]);

    const categories = await prisma.crisisTweet.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
    });

    const locations = await prisma.crisisTweet.groupBy({
      by: ["locationName"],
      where: {
        locationName: { not: null },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          locationName: "desc",
        },
      },
      take: 10,
    });

    return NextResponse.json({
      total,
      urgency: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      triageStatus: {
        unreviewed: unreviewedCount,
        reviewed: total - unreviewedCount,
      },
      categoryDistribution: categories.map((c) => ({
        category: c.category,
        count: c._count._all,
      })),
      topLocations: locations.map((loc) => ({
        location: loc.locationName,
        count: loc._count._all,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate crisis stats";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
