"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KpiRow, type KpiStats } from "./kpi-row";
import { CategoryBars, type CategoryMetric } from "./category-bars";
import { ImpactedZones, type LocationMetric } from "./impacted-zones";
import { LiveFeed, type CrisisTweetItem } from "./live-feed";
import { IngestTrigger } from "./ingest-trigger";
import { RefreshCw, Radio } from "lucide-react";

export function CommandCenter() {
  // Statistics State
  const [stats, setStats] = useState<KpiStats | null>(null);
  const [categories, setCategories] = useState<CategoryMetric[]>([]);
  const [locations, setLocations] = useState<LocationMetric[]>([]);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  // Tweets Feed State
  const [tweets, setTweets] = useState<CrisisTweetItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });
  const [loadingTweets, setLoadingTweets] = useState<boolean>(true);

  // Active Filter State
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [urgencyFilter, setUrgencyFilter] = useState<string | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 1. Fetch Aggregated Crisis Statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
      setCategories(data.categoryDistribution ?? []);
      setLocations(data.topLocations ?? []);
    } catch (err) {
      console.error("Error fetching crisis stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Filtered Tweets Feed
  const fetchTweets = useCallback(async () => {
    try {
      setLoadingTweets(true);
      const params = new URLSearchParams();

      if (categoryFilter && categoryFilter !== "ALL") {
        params.set("category", categoryFilter);
      }
      if (urgencyFilter && urgencyFilter !== "ALL") {
        params.set("urgency", urgencyFilter);
      }
      if (locationFilter) {
        params.set("location", locationFilter);
      }
      if (searchQuery) {
        params.set("q", searchQuery);
      }

      params.set("page", currentPage.toString());
      params.set("limit", "25");
      params.set("sortBy", "urgency");
      params.set("sortOrder", "asc");

      const res = await fetch(`/api/tweets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tweets");
      const data = await res.json();

      setTweets(data.tweets ?? []);
      setPagination(
        data.pagination ?? {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Error fetching crisis tweets:", err);
    } finally {
      setLoadingTweets(false);
    }
  }, [categoryFilter, urgencyFilter, locationFilter, searchQuery, currentPage]);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // Handle Filter Changes
  const handleFilterChange = (filters: {
    category?: string;
    urgency?: string;
    location?: string;
    q?: string;
    page?: number;
  }) => {
    if (filters.category !== undefined) setCategoryFilter(filters.category);
    if (filters.urgency !== undefined) setUrgencyFilter(filters.urgency);
    if (filters.location !== undefined) setLocationFilter(filters.location);
    if (filters.q !== undefined) setSearchQuery(filters.q);
    if (filters.page !== undefined) setCurrentPage(filters.page);
  };

  const handleResetFilters = () => {
    setCategoryFilter(undefined);
    setUrgencyFilter(undefined);
    setLocationFilter(undefined);
    setSearchQuery(undefined);
    setCurrentPage(1);
  };

  // Reload everything upon ingestion
  const handleIngestComplete = () => {
    fetchStats();
    fetchTweets();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Refresh & Ingest Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 border border-border/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Live Operations Desk</h2>
            <p className="text-xs text-muted-foreground">
              {stats?.total ? `${stats.total.toLocaleString()} active crisis signals loaded` : "Loading dataset..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchTweets();
            }}
            disabled={loadingStats || loadingTweets}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/80 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loadingStats || loadingTweets ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <IngestTrigger onIngestComplete={handleIngestComplete} />
        </div>
      </div>

      {/* 1. Responsive KPI Row */}
      <KpiRow
        stats={stats}
        loading={loadingStats}
        onSelectFilter={({ category, urgency }) => {
          setCategoryFilter(category);
          setUrgencyFilter(urgency);
          setCurrentPage(1);
        }}
        activeCategory={categoryFilter}
        activeUrgency={urgencyFilter}
      />

      {/* 2. Visual Category Triage Meter */}
      <CategoryBars
        categories={categories}
        total={stats?.total ?? 0}
        loading={loadingStats}
        selectedCategory={categoryFilter}
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setCurrentPage(1);
        }}
      />

      {/* 3. Top Impacted Calgary Flood Zones */}
      <ImpactedZones
        locations={locations}
        loading={loadingStats}
        selectedLocation={locationFilter}
        onSelectLocation={(loc) => {
          setLocationFilter(loc);
          setCurrentPage(1);
        }}
      />

      {/* 4. Live Operational Signal Feed */}
      <LiveFeed
        tweets={tweets}
        pagination={pagination}
        loading={loadingTweets}
        categoryFilter={categoryFilter}
        urgencyFilter={urgencyFilter}
        locationFilter={locationFilter}
        searchQuery={searchQuery}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}
