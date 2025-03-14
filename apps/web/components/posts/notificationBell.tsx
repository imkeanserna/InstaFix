"use client";

import { useNotificationHandler } from "@/hooks/notification/useNotifications";
import { Bell } from "lucide-react";

interface NotificationIconProps {
  isClickable?: boolean;
  className?: string;
}

export const NotificationIcon = ({ isClickable, className = '' }: NotificationIconProps) => {
  const { unreadCount, navigateToNotifications } = useNotificationHandler();
  const Component = isClickable ? 'button' : 'div';

  return (
    <div className={`relative ${className}`}>
      <Component
        className={`flex items-center gap-2 p-3 rounded-full transition-colors
          ${unreadCount > 0 ? 'bg-yellow-500' : 'bg-gray-100'}
          ${isClickable ? 'hover:bg-yellow-500 cursor-pointer hover:text-white' : ''}
        `}
        onClick={navigateToNotifications}
        type={isClickable ? 'button' : undefined}
      >
        <Bell
          className={`h-5 w-5 ${unreadCount > 0 ? 'text-white' : 'text-gray-900'}`}
        />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </div>
        )}
      </Component>
    </div>
  );
};
