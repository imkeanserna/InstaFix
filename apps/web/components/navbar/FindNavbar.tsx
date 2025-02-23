"use client";

import { Button } from "@repo/ui/components/ui/button";
import { LocationDialog } from "../posts/find/location";
import { SearchEngine } from "../posts/find/search-engine";
import { NotificationBell } from "../posts/notification/notification";

export function FindNavbar() {
  return (
    <div className="flex items-center justify-between">
      <h1>Find</h1>
      <LocationDialog>
        <Button>
          Select Location
        </Button>
      </LocationDialog>
      <SearchEngine>
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        >
          <span className="hidden lg:inline-flex">Search...</span>
          <span className="inline-flex lg:hidden">Search...</span>
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </SearchEngine>
      <Button>Be a Freelancer</Button>
      <NotificationBell />
    </div>
  );
}
