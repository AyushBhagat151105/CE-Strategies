"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ArrowUpCircle, Send, XCircle, X } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classifyCrisisTweet } from "@/lib/nlp-classifier";
import type { CrisisCategory, CrisisTweetRecord, UrgencyLevel } from "@/lib/types";

const CATEGORIES: CrisisCategory[] = [
  "RESCUE",
  "EVACUATION",
  "INFRASTRUCTURE",
  "AID",
  "VOLUNTEER",
  "ADVISORY",
  "NOISE",
  "UNCLASSIFIED",
];

const NEXT_URGENCY: Record<UrgencyLevel, UrgencyLevel> = {
  NONE: "LOW",
  LOW: "MEDIUM",
  MEDIUM: "HIGH",
  HIGH: "CRITICAL",
  CRITICAL: "CRITICAL",
};

interface ActionDialogProps {
  tweet: CrisisTweetRecord;
  pending: boolean;
  onClose: () => void;
  onAction: (body: Record<string, unknown>) => Promise<void>;
}

export function ActionDialog({ tweet, pending, onClose, onAction }: ActionDialogProps) {
  const [category, setCategory] = useState<CrisisCategory>(tweet.category);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setCategory(tweet.category);
    setNotes("");
  }, [tweet.id, tweet.category]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const classification = useMemo(() => classifyCrisisTweet(tweet.rawText), [tweet.rawText]);
  const categoryChanged = category !== tweet.category;
  const trimmedNotes = notes.trim();

  async function dispatchAction(body: Record<string, unknown>, closeOnSuccess: boolean) {
    await onAction({
      ...(categoryChanged && { category }),
      ...(trimmedNotes && { notes: trimmedNotes }),
      ...body,
    });
    if (closeOnSuccess) {
      onClose();
    } else {
      setNotes("");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className="w-full max-w-2xl rounded-xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tweet.status}</Badge>
              <Badge variant="outline">{tweet.locationName ?? "No location resolved"}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{tweet.rawText}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Matched signals (confidence {Math.round(classification.confidence * 100)}%)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {classification.matchedKeywords.length > 0 ? (
                classification.matchedKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No keyword matches</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reassign category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CrisisCategory)}
                className="block h-9 w-full rounded-md border border-input bg-background px-2 text-sm font-normal normal-case text-foreground"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current urgency
              <div className="flex h-9 items-center">
                <Badge
                  variant={
                    ({ CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low", NONE: "outline" } as const)[
                      tweet.urgency
                    ]
                  }
                >
                  {tweet.urgency}
                </Badge>
              </div>
            </div>
          </div>

          <label className="block space-y-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Operator notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add dispatch notes, caller callback info, resolution details…"
              className="block w-full rounded-md border border-input bg-background p-2 text-sm font-normal normal-case text-foreground"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 p-5">
          <Button
            variant="secondary"
            size="sm"
            disabled={pending || (!categoryChanged && !trimmedNotes)}
            onClick={() => dispatchAction({}, false)}
          >
            Save category & notes
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => dispatchAction({ status: "TRIAGED", isVerified: true }, true)}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => dispatchAction({ urgency: NEXT_URGENCY[tweet.urgency] }, false)}
            >
              <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
              Escalate
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => dispatchAction({ status: "DISPATCHED" }, true)}
            >
              <Send className="mr-1.5 h-3.5 w-3.5 text-cream" />
              Dispatch
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => dispatchAction({ status: "DISMISSED", urgency: "NONE" }, true)}
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Dismiss
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
