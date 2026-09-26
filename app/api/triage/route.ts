import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tweetId, status, urgency, category, isVerified, notes, operatorName } = body;

    if (!tweetId) {
      return NextResponse.json({ error: "tweetId is required" }, { status: 400 });
    }

    const currentTweet = await prisma.crisisTweet.findUnique({
      where: { id: tweetId },
    });

    if (!currentTweet) {
      return NextResponse.json({ error: "Tweet not found" }, { status: 404 });
    }

    const changes: Array<{ field: string; previous: string; next: string }> = [];
    if (status && status !== currentTweet.status) {
      changes.push({ field: "status", previous: currentTweet.status, next: status });
    }
    if (urgency && urgency !== currentTweet.urgency) {
      changes.push({ field: "urgency", previous: currentTweet.urgency, next: urgency });
    }
    if (category && category !== currentTweet.category) {
      changes.push({ field: "category", previous: currentTweet.category, next: category });
    }
    if (typeof isVerified === "boolean" && isVerified !== currentTweet.isVerified) {
      changes.push({
        field: "isVerified",
        previous: String(currentTweet.isVerified),
        next: String(isVerified),
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const tweet = await tx.crisisTweet.update({
        where: { id: tweetId },
        data: {
          ...(status && { status }),
          ...(urgency && { urgency }),
          ...(category && { category }),
          ...(typeof isVerified === "boolean" && { isVerified }),
        },
      });

      await tx.triageLog.create({
        data: {
          tweetId,
          action:
            changes.length > 0
              ? changes.map((c) => `${c.field.toUpperCase()}_CHANGED`).join("+")
              : "NOTE_ADDED",
          previousValue: changes.map((c) => `${c.field}=${c.previous}`).join(", ") || null,
          newValue: changes.map((c) => `${c.field}=${c.next}`).join(", ") || null,
          operatorNotes: notes ?? null,
          operatorName: operatorName ?? "Anonymous Operator",
        },
      });

      return tweet;
    });

    return NextResponse.json({ success: true, tweet: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply triage action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
