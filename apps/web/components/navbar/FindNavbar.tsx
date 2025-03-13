"use client";

import { Button } from "@repo/ui/components/ui/button";
import { LocationDialog } from "../posts/find/location";
import { SearchEngine } from "../posts/find/search-engine";
import { NotificationBell } from "../posts/notification/notification";
import ProfileDropdown from "../user/ProfileDropdown";
import { User } from "next-auth";
import { Earth, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function FindNavbar({ user }: { user: User | undefined }) {
  const pathname = usePathname();
  const hideSearchRoutes = ['/messages', '/notifications'];
  const hideNavBar = ['/'];
  const shouldHideSearch = hideSearchRoutes.includes(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname.includes("/book") || pathname.includes("/become-a-freelancer") || hideNavBar.includes(pathname)) {
    return null;
  }

  return (
    <div
      className={`sticky top-0 z-50 bg-white flex items-center justify-between pt-6 pb-4 border-b border-b-gray-200 px-24 transition-shadow duration-300 
        ${scrolled ? "shadow-lg" : "shadow-sm"}`}
    >
      <h1>Find</h1>
      <div className="flex gap-64 justify-center items-center">
        {!shouldHideSearch &&
          <SearchEngine>
            <Button
              variant="outline"
              className="relative h-9 justify-start text-sm group text-muted-foreground w-[28rem] py-7 pe-6 ps-2 rounded-full shadow-sm"
            >
              <div className="p-3 rounded-full bg-yellow-400 me-4 group-hover:bg-yellow-500">
                <Search className="w-4 h-4 text-gray-900" />
              </div>
              <span className="hidden lg:inline-flex">Search...</span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </SearchEngine>
        }
        <div className="flex gap-9">
          <LocationDialog>
            <div className="flex flex-col items-center">
              <Button
                variant="outline"
                className="active:scale-[0.97] gap-0 py-6 px-3 rounded-full hover:bg-yellow-400 hover:border-gray-900 hover:text-gray-900 relative"
              >
                <div className="space-y-1 flex flex-col items-center">
                  <Earth className="h-6 w-6 text-gray-700" />
                </div>
              </Button>
              <p className="text-xs font-medium">Location</p>
            </div>
          </LocationDialog>
          <NotificationBell />
          <ProfileDropdown user={user} />
        </div>
      </div>
    </div>
  );
}
