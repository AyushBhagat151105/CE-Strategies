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
          action: status ? `STATUS_CHANGED_TO_${status}` : "UPDATED",
          previousValue: currentTweet.status,
          newValue: status ?? currentTweet.status,
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
