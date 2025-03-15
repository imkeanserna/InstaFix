"use client";

import { useNotificationHandler } from "@/hooks/notification/useNotifications";
import { Button } from "@repo/ui/components/ui/button";
import { Inbox } from "lucide-react";

export function NotificationBell({ isScrolled }: { isScrolled: boolean }) {
  const { unreadCount, navigateToNotifications } = useNotificationHandler();
  return (
    <div className="flex flex-col items-center">
      <Button
        variant="outline"
        className="active:scale-[0.97] gap-0 py-6 px-3 rounded-full relative hover:bg-yellow-400 hover:border-gray-900 hover:text-gray-900"
        onClick={() => navigateToNotifications()}
      >
        <div className="space-y-1 flex flex-col items-center">
          <Inbox className="h-6 w-6 text-gray-700" />
        </div>
        {unreadCount > 0 && (
          <div className="px-2 py-1 rounded-full bg-yellow-500 text-gray-900 absolute top-0 right-0 flex items-center justify-center">
            <p className="text-xs">{unreadCount}</p>
          </div>
        )}
      </Button>
      {!isScrolled && <p className="text-xs font-medium transition-opacity duration-300 ease-in-out opacity-100">Bookings</p>}
    </div>
  );
}
