"use client"

import { getBookings } from "@/lib/bookingUtils";
import { TypedBooking } from "@repo/types";
import { useQuery } from "@tanstack/react-query";

export function useBookingData(postId: string) {
  const bookingQuery = useQuery<TypedBooking[], Error>({
    queryKey: ['post', postId, 'booking'],
    queryFn: async () => await getBookings({ postId: postId }),
    enabled: Boolean(postId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  return {
    bookingData: bookingQuery.data,
    isLoading: bookingQuery.isLoading,
    isError: bookingQuery.isError,
    error: bookingQuery.error
  };
}
