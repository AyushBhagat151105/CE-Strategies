"use client";

import { useState } from "react";
import { SlidersHorizontal } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FilterToolbar, type FilterToolbarLocation } from "./filter-toolbar";

interface FilterSheetFilters {
  category?: string;
  urgency?: string;
  location?: string;
  q?: string;
}

interface FilterSheetProps {
  filters: FilterSheetFilters;
  locations: FilterToolbarLocation[];
  onFilterChange: (filters: FilterSheetFilters & { page?: number }) => void;
  onResetFilters: () => void;
}

export function FilterSheet({ filters, locations, onFilterChange, onResetFilters }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [filters.category, filters.urgency, filters.location, filters.q].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full justify-between border-border bg-card text-foreground hover:bg-secondary">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filters
          </SheetTitle>
        </SheetHeader>
        <FilterToolbar filters={filters} locations={locations} onFilterChange={onFilterChange} onResetFilters={onResetFilters} />
      </SheetContent>
    </Sheet>
  );
}
