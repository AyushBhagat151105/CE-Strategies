"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Flame,
  ShieldAlert,
  Users,
  HeartHandshake,
  Megaphone,
  BellOff,
  MapPin,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  Smile,
  Frown,
} from "lucide-react";
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

interface LiveFeedProps {
  tweets: CrisisTweetItem[];
  pagination: PaginationInfo;
  loading: boolean;
  categoryFilter?: string;
  urgencyFilter?: string;
  locationFilter?: string;
  searchQuery?: string;
  onFilterChange: (filters: {
    category?: string;
    urgency?: string;
    location?: string;
    q?: string;
    page?: number;
  }) => void;
  onResetFilters: () => void;
}

const CATEGORIES = [
  { id: "ALL", label: "All Categories" },
  { id: "RESCUE", label: "Rescue", icon: Flame, color: "text-red-400" },
  { id: "INFRASTRUCTURE", label: "Infrastructure", icon: ShieldAlert, color: "text-amber-400" },
  { id: "VOLUNTEER", label: "Volunteer", icon: Users, color: "text-emerald-400" },
  { id: "AID", label: "Aid", icon: HeartHandshake, color: "text-cyan-400" },
  { id: "EVACUATION", label: "Evacuation", icon: ShieldAlert, color: "text-orange-400" },
  { id: "ADVISORY", label: "Advisory", icon: Megaphone, color: "text-blue-400" },
  { id: "NOISE", label: "Noise", icon: BellOff, color: "text-slate-400" },
];

const URGENCIES = [
  { id: "ALL", label: "All Urgency" },
  { id: "CRITICAL", label: "Critical", badgeVariant: "critical" },
  { id: "HIGH", label: "High", badgeVariant: "high" },
  { id: "MEDIUM", label: "Medium", badgeVariant: "medium" },
  { id: "LOW", label: "Low", badgeVariant: "low" },
  { id: "NONE", label: "None", badgeVariant: "outline" },
] as const;

export function LiveFeed({
  tweets,
  pagination,
  loading,
  categoryFilter,
  urgencyFilter,
  locationFilter,
  searchQuery,
  onFilterChange,
  onResetFilters,
}: LiveFeedProps) {
  const [searchInput, setSearchInput] = useState(searchQuery ?? "");
  const [expandedTweetId, setExpandedTweetId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ q: searchInput, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFilterChange({ q: "", page: 1 });
  };

  const hasActiveFilters = Boolean(
    (categoryFilter && categoryFilter !== "ALL") ||
      (urgencyFilter && urgencyFilter !== "ALL") ||
      locationFilter ||
      searchQuery
  );

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2 text-base">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Operational Signal Feed
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prioritized crisis stream sorted by emergency urgency rank
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search text, #yychelps, location..."
                className="w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-8 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 border border-border transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filter Controls: Categories & Urgencies */}
        <div className="space-y-3 pt-3 border-t border-border/60">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = (!categoryFilter && cat.id === "ALL") || categoryFilter === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      category: cat.id === "ALL" ? undefined : cat.id,
                      page: 1,
                    })
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0 transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50"
                  }`}
                >
                  {Icon && <Icon className={`h-3 w-3 ${isSelected ? "text-primary-foreground" : cat.color}`} />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Urgency Pills & Active Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
                Urgency:
              </span>
              {URGENCIES.map((u) => {
                const isSelected = (!urgencyFilter && u.id === "ALL") || urgencyFilter === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        urgency: u.id === "ALL" ? undefined : u.id,
                        page: 1,
                      })
                    }
                    className={`rounded-md px-2.5 py-0.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-white text-black font-bold shadow-sm"
                        : "bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/40"
                    }`}
                  >
                    {u.label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
              >
                <X className="h-3.5 w-3.5" />
                Reset all filters
              </button>
            )}
          </div>

          {locationFilter && (
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="text-muted-foreground">Location scoped:</span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-2 py-0.5">
                <MapPin className="h-3 w-3" />
                {locationFilter}
                <button
                  type="button"
                  onClick={() => onFilterChange({ location: undefined, page: 1 })}
                  className="hover:text-white ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </div>
          )}
        </div>
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
            <h4 className="text-sm font-semibold text-white">No distress signals found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No tweets match the selected combination of filters. Try clearing your search query or selecting &quot;All Categories&quot;.
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
          tweets.map((tweet) => {
            const isCritical = tweet.urgency === "CRITICAL";
            const isHigh = tweet.urgency === "HIGH";
            const isExpanded = expandedTweetId === tweet.id;

            return (
              <div
                key={tweet.id}
                className={`rounded-xl border p-4 transition-all duration-150 hover:border-border/80 ${
                  isCritical
                    ? "border-red-800/80 bg-red-950/20 shadow-sm"
                    : isHigh
                    ? "border-amber-800/60 bg-amber-950/10"
                    : "border-border/60 bg-card hover:bg-card/90"
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
                      <span className="rounded-full bg-blue-950/80 border border-blue-700 px-2 py-0.5 text-[10px] text-blue-300 font-semibold">
                        Verified
                      </span>
                    )}

                    {/* Location Badge */}
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

                  {/* Timestamp & Row Index */}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    {tweet.sourceRowIndex !== null && (
                      <span>Row #{tweet.sourceRowIndex}</span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(tweet.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Tweet Text Content */}
                <p className="text-sm text-foreground/95 leading-relaxed font-normal mt-1">
                  {tweet.cleanText || tweet.rawText}
                </p>

                {/* Footer Controls: Raw text toggle & Triage action link */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedTweetId(isExpanded ? null : tweet.id)}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-mono"
                  >
                    {isExpanded ? "Hide raw text" : "View raw text"}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/triage?id=${tweet.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Triage in Queue</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Raw Text Drawer */}
                {isExpanded && (
                  <div className="mt-2 rounded-lg bg-black/50 border border-border/60 p-2.5 text-xs font-mono text-muted-foreground break-all">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Original Raw Social Payload:
                    </span>
                    {tweet.rawText}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="rounded-xl border border-border/80 bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
              onClick={() => onFilterChange({ page: pagination.page - 1 })}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 font-medium text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <span className="px-2 font-mono text-muted-foreground">
              Page <span className="text-white font-bold">{pagination.page}</span> of{" "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => onFilterChange({ page: pagination.page + 1 })}
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
