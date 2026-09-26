"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Loader2, RotateCcw, ShieldCheck } from "@/components/icons";
import { ActionDialog } from "@/components/triage/action-dialog";
import { QueueRow } from "@/components/triage/queue-row";
import type { CrisisTweetRecord, UrgencyLevel } from "@/lib/types";

const URGENCY_BY_KEY: Record<string, UrgencyLevel> = {
  "1": "CRITICAL",
  "2": "HIGH",
  "3": "MEDIUM",
  "4": "LOW",
};

const NEXT_URGENCY: Record<UrgencyLevel, UrgencyLevel> = {
  NONE: "LOW",
  LOW: "MEDIUM",
  MEDIUM: "HIGH",
  HIGH: "CRITICAL",
  CRITICAL: "CRITICAL",
};

const OPERATOR_STORAGE_KEY = "ce-strategies-operator-name";

export default function TriagePage() {
  const [tweets, setTweets] = useState<CrisisTweetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState("Dispatcher");
  const [detailTweetId, setDetailTweetId] = useState<string | null>(null);

  const tweetsRef = useRef(tweets);
  tweetsRef.current = tweets;
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const stored = window.localStorage.getItem(OPERATOR_STORAGE_KEY);
    if (stored) setOperatorName(stored);
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tweets?status=UNREVIEWED&limit=50");
      if (!res.ok) throw new Error("Failed to load triage queue");
      const data = await res.json();
      setTweets(data.tweets as CrisisTweetRecord[]);
      setFocusedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load triage queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const applyAction = useCallback(
    async (tweetId: string, body: Record<string, unknown>) => {
      setPendingId(tweetId);
      try {
        const res = await fetch("/api/triage", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tweetId, operatorName, ...body }),
        });
        if (!res.ok) throw new Error("Triage action failed");
        const data = await res.json();
        const updatedTweet = data.tweet as CrisisTweetRecord;

        setTweets((prev) => {
          if (updatedTweet.status !== "UNREVIEWED") {
            const next = prev.filter((t) => t.id !== tweetId);
            setFocusedIndex((i) => Math.min(i, Math.max(next.length - 1, 0)));
            return next;
          }
          return prev.map((t) => (t.id === tweetId ? updatedTweet : t));
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Triage action failed");
      } finally {
        setPendingId(null);
      }
    },
    [operatorName]
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (detailTweetId) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const focused = tweetsRef.current[focusedIndex];

      switch (e.key.toLowerCase()) {
        case "arrowdown":
        case "j":
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, tweetsRef.current.length - 1));
          return;
        case "arrowup":
        case "k":
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          return;
        default:
          break;
      }

      if (!focused || pendingId) return;

      switch (e.key.toLowerCase()) {
        case "v":
          applyAction(focused.id, { status: "TRIAGED", isVerified: true });
          break;
        case "d":
          applyAction(focused.id, { status: "DISPATCHED" });
          break;
        case "e":
          applyAction(focused.id, { urgency: NEXT_URGENCY[focused.urgency] });
          break;
        case "x":
          applyAction(focused.id, { status: "DISMISSED", category: "NOISE", urgency: "NONE" });
          break;
        case "1":
        case "2":
        case "3":
        case "4":
          applyAction(focused.id, { urgency: URGENCY_BY_KEY[e.key] });
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedIndex, pendingId, applyAction, detailTweetId]);

  useEffect(() => {
    const focused = tweets[focusedIndex];
    if (focused) {
      rowRefs.current[focused.id]?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIndex, tweets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Emergency Dispatcher Queue</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Operator
            <input
              value={operatorName}
              onChange={(e) => {
                setOperatorName(e.target.value);
                window.localStorage.setItem(OPERATOR_STORAGE_KEY, e.target.value);
              }}
              className="h-8 w-32 rounded-md border border-input bg-background px-2 text-xs text-foreground"
            />
          </label>
          <button
            onClick={loadQueue}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-transparent bg-card/60 p-3 text-xs text-muted-foreground transition-colors hover:border-border/60">
        <span className="font-medium text-foreground">Keyboard shortcuts:</span>{" "}
        <kbd className="rounded border border-border bg-secondary px-1">↑</kbd>/<kbd className="rounded border border-border bg-secondary px-1">↓</kbd> move focus ·{" "}
        <kbd className="rounded border border-border bg-secondary px-1">V</kbd> verify ·{" "}
        <kbd className="rounded border border-border bg-secondary px-1">E</kbd> escalate ·{" "}
        <kbd className="rounded border border-border bg-secondary px-1">D</kbd> dispatch ·{" "}
        <kbd className="rounded border border-border bg-secondary px-1">X</kbd> dismiss ·{" "}
        <kbd className="rounded border border-border bg-secondary px-1">1</kbd>–<kbd className="rounded border border-border bg-secondary px-1">4</kbd> set urgency (Critical→Low)
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-transparent bg-card/40 p-12 text-sm text-muted-foreground transition-colors hover:border-border/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading queue…
        </div>
      ) : tweets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-12 text-emerald-300">
          <ShieldCheck className="h-6 w-6" />
          Queue clear — no unreviewed signals.
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {tweets.map((tweet, index) => (
              <motion.div
                key={tweet.id}
                ref={(el) => { rowRefs.current[tweet.id] = el; }}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <QueueRow
                  tweet={tweet}
                  focused={index === focusedIndex}
                  pending={pendingId === tweet.id}
                  onOpenDetail={() => {
                    setFocusedIndex(index);
                    setDetailTweetId(tweet.id);
                  }}
                  onVerify={() => applyAction(tweet.id, { status: "TRIAGED", isVerified: true })}
                  onEscalate={() => applyAction(tweet.id, { urgency: NEXT_URGENCY[tweet.urgency] })}
                  onDispatch={() => applyAction(tweet.id, { status: "DISPATCHED" })}
                  onDismiss={() =>
                    applyAction(tweet.id, { status: "DISMISSED", category: "NOISE", urgency: "NONE" })
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {(() => {
          const detailTweet = tweets.find((t) => t.id === detailTweetId);
          if (!detailTweet) return null;
          return (
            <ActionDialog
              key={detailTweet.id}
              tweet={detailTweet}
              pending={pendingId === detailTweet.id}
              onClose={() => setDetailTweetId(null)}
              onAction={(body) => applyAction(detailTweet.id, body)}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
