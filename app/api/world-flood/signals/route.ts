import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get("country");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip = (page - 1) * limit;

    const where = country && country !== "ALL" ? { country } : {};

    const [total, signals] = await Promise.all([
      prisma.floodSignal.count({ where }),
      prisma.floodSignal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      signals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch flood signals";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
