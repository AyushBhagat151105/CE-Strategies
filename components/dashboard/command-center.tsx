"use client";

import React, { useState, useEffect, useCallback } from "react";
import { KpiRow, type KpiStats } from "./kpi-row";
import { CategoryDonut, type CategoryMetric } from "./category-donut";
import { ImpactedZones, type LocationMetric } from "./impacted-zones";
import { LiveFeed, type CrisisTweetItem } from "./live-feed";
import { FilterSheet } from "./filter-sheet";

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

  // Active Filter State — the filter toolbar is the single source of truth for all of these
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

      if (categoryFilter) params.set("category", categoryFilter);
      if (urgencyFilter) params.set("urgency", urgencyFilter);
      if (locationFilter) params.set("location", locationFilter);
      if (searchQuery) params.set("q", searchQuery);

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

  // Handle Filter Changes — the ONLY place filter state is mutated from
  const handleFilterChange = (filters: {
    category?: string;
    urgency?: string;
    location?: string;
    q?: string;
    page?: number;
  }) => {
    if ("category" in filters) setCategoryFilter(filters.category);
    if ("urgency" in filters) setUrgencyFilter(filters.urgency);
    if ("location" in filters) setLocationFilter(filters.location);
    if ("q" in filters) setSearchQuery(filters.q || undefined);
    if (filters.page !== undefined) setCurrentPage(filters.page);
  };

  const handleResetFilters = () => {
    setCategoryFilter(undefined);
    setUrgencyFilter(undefined);
    setLocationFilter(undefined);
    setSearchQuery(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        {/* Primary focus: at-a-glance numbers, then the live feed */}
        <KpiRow
          stats={stats}
          loading={loadingStats}
          activeCategory={categoryFilter}
          onSelectCategory={(category) =>
            handleFilterChange({ category: categoryFilter === category ? undefined : category, page: 1 })
          }
          onReset={handleResetFilters}
        />

        <LiveFeed
          tweets={tweets}
          pagination={pagination}
          loading={loadingTweets}
          filters={{
            category: categoryFilter,
            urgency: urgencyFilter,
            location: locationFilter,
            q: searchQuery,
          }}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Right column: filters + most impacted zones, sticky */}
      <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-6 lg:w-72">
        <FilterSheet
          filters={{
            category: categoryFilter,
            urgency: urgencyFilter,
            location: locationFilter,
            q: searchQuery,
          }}
          locations={locations}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        <ImpactedZones
          locations={locations}
          loading={loadingStats}
          activeLocation={locationFilter}
          onSelectLocation={(name) =>
            handleFilterChange({ location: locationFilter === name ? undefined : name, page: 1 })
          }
        />
        <CategoryDonut categories={categories} total={stats?.total ?? 0} loading={loadingStats} />
      </aside>
    </div>
  );
}
