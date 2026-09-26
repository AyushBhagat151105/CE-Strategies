import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extraction & normalization of filters
    const categoryParam = searchParams.get("category");
    const urgencyParam = searchParams.get("urgency");
    const locationParam = searchParams.get("location");
    const statusParam = searchParams.get("status");
    const sentimentParam = searchParams.get("sentiment");
    const isVerifiedParam = searchParams.get("isVerified");
    const hasLocationParam = searchParams.get("hasLocation");
    const query = searchParams.get("q")?.trim();

    // Pagination
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "25", 10)));
    const skip = (page - 1) * limit;

    // Sorting options
    const sortBy = searchParams.get("sortBy") ?? searchParams.get("sort") ?? "urgency";
    const sortOrder = searchParams.get("sortOrder") ?? searchParams.get("order") ?? "asc";
    const isAsc = sortOrder.toLowerCase() === "asc";

    // Build parameterized SQL conditions
    const conditions: Prisma.Sql[] = [];

    // Category filter (supports comma-separated list)
    if (categoryParam && categoryParam !== "ALL") {
      const categories = categoryParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (categories.length === 1) {
        conditions.push(Prisma.sql`category = ${categories[0]}`);
      } else if (categories.length > 1) {
        conditions.push(Prisma.sql`category IN (${Prisma.join(categories)})`);
      }
    }

    // Urgency filter (supports comma-separated list)
    if (urgencyParam && urgencyParam !== "ALL") {
      const urgencies = urgencyParam.split(",").map((u) => u.trim()).filter(Boolean);
      if (urgencies.length === 1) {
        conditions.push(Prisma.sql`urgency = ${urgencies[0]}`);
      } else if (urgencies.length > 1) {
        conditions.push(Prisma.sql`urgency IN (${Prisma.join(urgencies)})`);
      }
    }

    // Location filter (supports comma-separated list)
    if (locationParam && locationParam !== "ALL") {
      const locations = locationParam.split(",").map((l) => l.trim()).filter(Boolean);
      if (locations.length === 1) {
        conditions.push(Prisma.sql`"locationName" = ${locations[0]}`);
      } else if (locations.length > 1) {
        conditions.push(Prisma.sql`"locationName" IN (${Prisma.join(locations)})`);
      }
    }

    // Status filter (supports comma-separated list)
    if (statusParam && statusParam !== "ALL") {
      const statuses = statusParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length === 1) {
        conditions.push(Prisma.sql`status = ${statuses[0]}`);
      } else if (statuses.length > 1) {
        conditions.push(Prisma.sql`status IN (${Prisma.join(statuses)})`);
      }
    }

    // Sentiment filter
    if (sentimentParam && sentimentParam !== "ALL") {
      const sentiments = sentimentParam.split(",").map((s) => s.trim()).filter(Boolean);
      if (sentiments.length === 1) {
        conditions.push(Prisma.sql`sentiment = ${sentiments[0]}`);
      } else if (sentiments.length > 1) {
        conditions.push(Prisma.sql`sentiment IN (${Prisma.join(sentiments)})`);
      }
    }

    // Verification status filter
    if (isVerifiedParam !== null && isVerifiedParam !== undefined) {
      if (isVerifiedParam === "true") {
        conditions.push(Prisma.sql`"isVerified" = true`);
      } else if (isVerifiedParam === "false") {
        conditions.push(Prisma.sql`"isVerified" = false`);
      }
    }

    // Geographic presence filter (essential for map view)
    if (hasLocationParam === "true") {
      conditions.push(Prisma.sql`"locationName" IS NOT NULL`);
    } else if (hasLocationParam === "false") {
      conditions.push(Prisma.sql`"locationName" IS NULL`);
    }

    // Text search filter across cleanText, rawText, and locationName
    if (query) {
      const searchPattern = `%${query}%`;
      conditions.push(
        Prisma.sql`("cleanText" ILIKE ${searchPattern} OR "rawText" ILIKE ${searchPattern} OR "locationName" ILIKE ${searchPattern})`
      );
    }

    const whereClause = conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, " AND ")}` : Prisma.empty;

    // Build dynamic ORDER BY clause
    let orderClause: Prisma.Sql;
    if (sortBy === "urgency") {
      // Emergency priority ranking: CRITICAL (1) > HIGH (2) > MEDIUM (3) > LOW (4) > NONE (5)
      orderClause = isAsc
        ? Prisma.sql`
            ORDER BY
              CASE urgency
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
              END ASC,
              "createdAt" DESC`
        : Prisma.sql`
            ORDER BY
              CASE urgency
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                WHEN 'LOW' THEN 4
                ELSE 5
              END DESC,
              "createdAt" DESC`;
    } else if (sortBy === "date" || sortBy === "createdAt") {
      orderClause = isAsc
        ? Prisma.sql`ORDER BY "createdAt" ASC, id ASC`
        : Prisma.sql`ORDER BY "createdAt" DESC, id DESC`;
    } else if (sortBy === "location") {
      orderClause = isAsc
        ? Prisma.sql`ORDER BY "locationName" ASC NULLS LAST, "createdAt" DESC`
        : Prisma.sql`ORDER BY "locationName" DESC NULLS LAST, "createdAt" DESC`;
    } else if (sortBy === "status") {
      orderClause = isAsc
        ? Prisma.sql`ORDER BY status ASC, "createdAt" DESC`
        : Prisma.sql`ORDER BY status DESC, "createdAt" DESC`;
    } else if (sortBy === "index" || sortBy === "sourceRowIndex") {
      orderClause = isAsc
        ? Prisma.sql`ORDER BY "sourceRowIndex" ASC`
        : Prisma.sql`ORDER BY "sourceRowIndex" DESC`;
    } else {
      orderClause = Prisma.sql`ORDER BY "createdAt" DESC`;
    }

    // Execute paginated select and total count in parallel
    const [totalResult, tweets] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "CrisisTweet"
        ${whereClause}
      `,
      prisma.$queryRaw<Array<unknown>>`
        SELECT
          id,
          "rawText",
          "cleanText",
          category,
          urgency,
          sentiment,
          "locationName",
          latitude,
          longitude,
          author,
          "isVerified",
          status,
          "sourceRowIndex",
          "createdAt",
          "updatedAt"
        FROM "CrisisTweet"
        ${whereClause}
        ${orderClause}
        LIMIT ${limit} OFFSET ${skip}
      `,
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

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
