"use client";

import { useEffect, useState } from "react";
import { Search, X } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterToolbarLocation {
  name: string;
  count: number;
}

interface FilterToolbarFilters {
  category?: string;
  urgency?: string;
  location?: string;
  q?: string;
}

interface FilterToolbarProps {
  filters: FilterToolbarFilters;
  locations: FilterToolbarLocation[];
  onFilterChange: (filters: FilterToolbarFilters & { page?: number }) => void;
  onResetFilters: () => void;
}

const CATEGORIES = [
  { id: "RESCUE", label: "Rescue" },
  { id: "EVACUATION", label: "Evacuation" },
  { id: "INFRASTRUCTURE", label: "Infrastructure" },
  { id: "VOLUNTEER", label: "Volunteer" },
  { id: "AID", label: "Aid & Donations" },
  { id: "ADVISORY", label: "Advisory" },
  { id: "NOISE", label: "Noise" },
];

const URGENCIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"];

export function FilterToolbar({ filters, locations, onFilterChange, onResetFilters }: FilterToolbarProps) {
  const [searchInput, setSearchInput] = useState(filters.q ?? "");

  useEffect(() => {
    setSearchInput(filters.q ?? "");
  }, [filters.q]);

  const hasActiveFilters = Boolean(filters.category || filters.urgency || filters.location || filters.q);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ q: searchInput, page: 1 });
  };

  return (
    <div className="space-y-4">
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              onResetFilters();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-300"
          >
            <X className="h-3 w-3" />
            Reset all
          </button>
        </div>
      )}

      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search text, #yychelps..."
            className="w-full rounded-lg border border-input bg-secondary/40 py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
        <Select
          value={filters.category ?? "ALL"}
          onValueChange={(v) => onFilterChange({ category: v === "ALL" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Urgency</p>
        <Select
          value={filters.urgency ?? "ALL"}
          onValueChange={(v) => onFilterChange({ urgency: v === "ALL" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Urgency</SelectItem>
            {URGENCIES.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
        <Select
          value={filters.location ?? "ALL"}
          onValueChange={(v) => onFilterChange({ location: v === "ALL" ? undefined : v, page: 1 })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.name} value={loc.name}>
                {loc.name} ({loc.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
