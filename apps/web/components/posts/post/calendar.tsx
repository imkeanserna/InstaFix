"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DualCalendar, SingleCalendar } from "@repo/ui/components/ui/calendar"
import { useBookingData } from "@/hooks/posts/useBookingData";
import { User } from "next-auth";

export function PostCalendar({ postId, user }: { postId: string, user: User | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { bookingData, isLoading, isError } = useBookingData(postId);

  // Get date from URL or default to today
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : undefined;

  // Prevent selecting dates in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Create new URLSearchParams object with current params
      const params = new URLSearchParams(searchParams.toString());
      const formattedDate = date.toLocaleDateString('en-CA');
      params.set('date', formattedDate);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const clearDate = () => {
    // Create new URLSearchParams object with current params
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex justify-center items-center">
      <div className="block sm:hidden">
        <SingleCalendar
          selectedDate={selectedDate}
          onSelect={(date) => {
            handleDateSelect(date);
          }}
          clearSelectedDate={clearDate}
          bookings={bookingData || []}
          userId={user?.id || ''}
        />
      </div>
      <div className="hidden sm:flex">
        <DualCalendar
          selectedDate={selectedDate}
          onSelect={(date) => {
            handleDateSelect(date);
          }}
          clearSelectedDate={clearDate}
          bookings={bookingData || []}
          userId={user?.id || ''}
        />
      </div>
    </div>
  );
}
