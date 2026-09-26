import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency");
    const location = searchParams.get("location");
    const status = searchParams.get("status");
    const query = searchParams.get("q");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(10, Number.parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category && category !== "ALL") where.category = category;
    if (urgency && urgency !== "ALL") where.urgency = urgency;
    if (location && location !== "ALL") where.locationName = location;
    if (status && status !== "ALL") where.status = status;
    if (query) {
      where.rawText = {
        contains: query,
        mode: "insensitive",
      };
    }

    const [total, tweets] = await Promise.all([
      prisma.crisisTweet.count({ where }),
      prisma.crisisTweet.findMany({
        where,
        orderBy: [{ urgency: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      tweets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tweets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
