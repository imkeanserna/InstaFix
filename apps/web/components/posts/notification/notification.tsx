"use client";

import { useNotificationHandler } from "@/hooks/notification/useNotifications";
import { Currency } from "@/hooks/useCurrency";
import { Button } from "@repo/ui/components/ui/button";
import { Inbox } from "lucide-react";

export function NotificationBell({ scrollProgress }: { scrollProgress: number }) {
  const { unreadCount, navigateToNotifications } = useNotificationHandler();
  return (
    <div className="flex flex-col items-center">
      <Button
        variant="outline"
        className="active:scale-[0.97] gap-0 py-6 px-3 rounded-full relative border-none hover:bg-yellow-400 hover:border-gray-900 hover:text-gray-900"
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
      <p
        className="text-xs font-medium transition-all duration-300 ease-in-out opacity-100"
        style={{
          opacity: scrollProgress < 0.5 ? 1 - scrollProgress * 2 : 0,
          height: scrollProgress < 0.5 ? '16px' : '0px',
          overflow: 'hidden'
        }}
      >
        Bookings
      </p>
    </div>
  );
}

export function CurrencyToggle({
  currency,
  changeCurrency
}: {
  currency: Currency;
  changeCurrency: (currency: Currency) => void
}) {
  return (
    <div
      className="transition-all group justify-between items-center flex flex-col gap-2 text-gray-900 hover:bg-transparent"
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          onClick={() => changeCurrency("USD")}
          className={`flex items-center border-none gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.97]
                      ${currency === "USD" ? 'text-gray-600 font-semibold bg-gray-100' : 'text-gray-600 hover:text-gray-900'}`}
        >
          USD
        </Button>
        <Button
          variant="outline"
          onClick={() => changeCurrency("PHP")}
          className={`flex items-center border-none gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.97]
                      ${currency === "PHP" ? 'text-gray-600 font-semibold bg-gray-100' : 'text-gray-600 hover:text-gray-900'}`}
        >
          PHP
        </Button>
      </div>
    </div>
  );
}
