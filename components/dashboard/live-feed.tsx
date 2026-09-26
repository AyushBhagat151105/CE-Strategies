"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, ExternalLink, AlertTriangle, X, ChevronLeft, ChevronRight } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export interface CrisisTweetItem {
  id: string;
  rawText: string;
  cleanText: string | null;
  category: string;
  urgency: string;
  sentiment: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  author: string | null;
  isVerified: boolean;
  status: string;
  sourceRowIndex: number | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActiveFilters {
  category?: string;
  urgency?: string;
  location?: string;
  q?: string;
}

interface LiveFeedProps {
  tweets: CrisisTweetItem[];
  pagination: PaginationInfo;
  loading: boolean;
  filters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters & { page?: number }) => void;
  onResetFilters: () => void;
  onPageChange: (page: number) => void;
}

function FilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 border border-border/60 px-2.5 py-1 text-foreground">
      {label}
      <button type="button" onClick={onClear} className="hover:text-foreground">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function LiveFeed({
  tweets,
  pagination,
  loading,
  filters,
  onFilterChange,
  onResetFilters,
  onPageChange,
}: LiveFeedProps) {
  const hasActiveFilters = Boolean(filters.category || filters.urgency || filters.location || filters.q);

  return (
    <div className="space-y-4">
      {/* Header & Active Filter Summary */}
      <div className="rounded-xl border border-transparent bg-card p-5 transition-colors hover:border-border/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Operational Signal Feed
            </h3>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t border-border/60 text-xs">
            <span className="text-muted-foreground shrink-0">Active filters:</span>
            {filters.category && (
              <FilterPill
                label={`Category: ${filters.category}`}
                onClear={() => onFilterChange({ category: undefined, page: 1 })}
              />
            )}
            {filters.urgency && (
              <FilterPill
                label={`Urgency: ${filters.urgency}`}
                onClear={() => onFilterChange({ urgency: undefined, page: 1 })}
              />
            )}
            {filters.location && (
              <FilterPill
                label={`Location: ${filters.location}`}
                onClear={() => onFilterChange({ location: undefined, page: 1 })}
              />
            )}
            {filters.q && (
              <FilterPill
                label={`Search: "${filters.q}"`}
                onClear={() => onFilterChange({ q: undefined, page: 1 })}
              />
            )}
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-300 font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Feed Cards List */}
      <div className="space-y-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/60 bg-card p-4 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-5 w-20 rounded-full bg-slate-800" />
                <div className="h-5 w-24 rounded-full bg-slate-800" />
                <div className="h-4 w-32 rounded bg-slate-800" />
              </div>
              <div className="h-4 w-full rounded bg-slate-800" />
              <div className="h-4 w-3/4 rounded bg-slate-800" />
            </div>
          ))
        ) : tweets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/60 p-10 text-center space-y-3">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
            <h4 className="text-sm font-semibold text-foreground">No distress signals found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No tweets match the selected filters. Try clearing a filter in the panel.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 border border-border"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tweets.map((tweet) => {
              const isCritical = tweet.urgency === "CRITICAL";
              const isHigh = tweet.urgency === "HIGH";

                  return (
                    <motion.div
                      key={tweet.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={`rounded-xl border p-4 transition-colors ${
                        isCritical
                          ? "border-red-800/50 bg-red-950/10"
                          : isHigh
                          ? "border-amber-800/60 bg-amber-950/10"
                          : "border-transparent bg-card hover:border-border/60"
                      }`}
                    >
                {/* Meta Badges Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Urgency Badge */}
                    <Badge
                      variant={
                        tweet.urgency === "CRITICAL"
                          ? "critical"
                          : tweet.urgency === "HIGH"
                          ? "high"
                          : tweet.urgency === "MEDIUM"
                          ? "medium"
                          : tweet.urgency === "LOW"
                          ? "low"
                          : "outline"
                      }
                    >
                      {tweet.urgency}
                    </Badge>

                    {/* Category Badge */}
                    <span className="rounded-full bg-secondary/80 border border-border px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                      {tweet.category}
                    </span>

                    {/* Sentiment Tag */}
                    {tweet.sentiment && tweet.sentiment !== "NEUTRAL" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                          tweet.sentiment === "PANIC"
                            ? "border-red-600 bg-red-950/80 text-red-300 animate-pulse"
                            : tweet.sentiment === "HOPEFUL"
                            ? "border-emerald-600 bg-emerald-950/80 text-emerald-300"
                            : "border-amber-600 bg-amber-950/80 text-amber-300"
                        }`}
                      >
                        {tweet.sentiment}
                      </span>
                    )}

                    {/* Verified indicator */}
                    {tweet.isVerified && (
                      <span className="rounded-full bg-cream/10 border border-cream/40 px-2 py-0.5 text-[10px] text-cream font-semibold">
                        Verified
                      </span>
                    )}

                    {/* Location Badge — quick-jump into the location filter */}
                    {tweet.locationName && (
                      <button
                        type="button"
                        onClick={() =>
                          onFilterChange({ location: tweet.locationName ?? undefined, page: 1 })
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-800/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                      >
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{tweet.locationName}</span>
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/triage?id=${tweet.id}`}
                    title="Triage in Queue"
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                      {/* Tweet Text Content */}
                      <p className="text-sm text-foreground/95 leading-relaxed font-normal mt-1">
                        {tweet.cleanText || tweet.rawText}
                      </p>
                    </motion.div>
                  );
                })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="rounded-xl border border-transparent bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors hover:border-border/80">
          <div className="text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {((pagination.page - 1) * pagination.limit + 1).toLocaleString()}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-foreground">
              {Math.min(pagination.page * pagination.limit, pagination.total).toLocaleString()}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">{pagination.total.toLocaleString()}</span>{" "}
            crisis signals
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => onPageChange(pagination.page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <span className="px-2 font-mono text-muted-foreground">
              Page <span className="text-foreground font-bold">{pagination.page}</span> of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onPageChange(pagination.page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
