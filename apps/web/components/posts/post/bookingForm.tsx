"use client";

import { Button } from "@repo/ui/components/ui/button";
import { DynamicInput } from "@repo/ui/components/ui/dynamic-input";
import { Input } from "@repo/ui/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/ui/popover";
import { SingleCalendar } from "@repo/ui/components/ui/calendar"
import { Minus, Plus } from "lucide-react";
import { z } from 'zod';
import { useBookingData } from "@/hooks/posts/useBookingData";
import { User } from "next-auth";
import { formatPrice } from "@/lib/postUtils";
import { useAuthModal } from "@repo/ui/context/AuthModalProvider";
import { useMediaQuery } from "@/hooks/useMedia";

export const createBookingSchema = z.object({
  date: z.date(),
  description: z.string()
    .min(5, "Description must be at least 5 characters long")
    .max(500, "Description must not exceed 500 characters")
    .trim(),
  quantity: z.number().positive().int(),
});

export function BookingForm({
  postId,
  user,
  rate,
  username,
  freelancerId
}: {
  postId: string,
  user: User | null
  rate: number
  username: string
  freelancerId: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [description, setDescription] = useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState("");
  const dateParam = searchParams.get('date');
  const selectedDate = dateParam ? new Date(dateParam) : undefined;
  const [inputDate, setInputDate] = useState<string>('');
  const { openModal } = useAuthModal();

  const { bookingData, isLoading, isError } = useBookingData(postId);

  useEffect(() => {
    setTimeout(() => {
      if (error) {
        setError('');
      }
    }, 3000)
  }, [error]);

  useEffect(() => {
    if (dateParam) {
      const date = new Date(dateParam);
      setInputDate(
        date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        })
      );
    } else {
      setInputDate('');
    }
  }, [dateParam]);

  // Prevent selecting dates in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const params = new URLSearchParams(searchParams.toString());
      const formattedDate = date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      params.set('date', formattedDate);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const clearDate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('date');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDescription(newValue);
  };

  const handleSubmit = async () => {
    setError("");

    if (user == null) {
      if (isMobile) {
        router.push("/auth/login");
        return;
      }
      openModal();
      return;
    }

    try {
      if (!selectedDate) {
        setError("Please select a date");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError("Cannot book a date in the past");
        return;
      }
      const bookingData = createBookingSchema.parse({
        date: selectedDate,
        description: description,
        quantity: quantity,
      });

      const formattedDate = bookingData.date.toISOString().split('T')[0];
      const baseUrl = `/book/${encodeURIComponent(username)}/${encodeURIComponent(postId)}`;
      const queryParams = new URLSearchParams({
        freelancerId: freelancerId,
        checkout: formattedDate,
        description: bookingData.description,
        numberOfItems: bookingData.quantity.toString()
      }).toString();
      const fullUrl = `${baseUrl}?${queryParams}`;
      router.push(fullUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking";
      setError(errorMessage);
    }
  };

  const isValidDateFormat = (dateString: string): boolean => {
    // Regular expression for mm/dd/yyyy format
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    // Check if the string matches the format
    if (!dateRegex.test(dateString)) {
      return false;
    }

    // Validation to check if it's a valid date
    const parts = dateString.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check for month, day, and year ranges
    if (year < 1000 || year > 9999) return false;

    const testDate = new Date(year, month - 1, day);
    return testDate.getFullYear() === year &&
      testDate.getMonth() === month - 1 &&
      testDate.getDate() === day;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove non-numeric characters except '/'
    value = value.replace(/[^0-9/]/g, '');

    // Auto-format with slashes
    if (value.length === 2 && !value.includes('/')) {
      value += '/';
    } else if (value.length === 5 && value.split('/').length === 2) {
      value += '/';
    }

    // Limit to 10 characters
    value = value.slice(0, 10);
    setInputDate(value);

    if (isValidDateFormat(value)) {
      const parsedDate = new Date(value);

      // Check if date is in the past
      if (parsedDate.getTime() < new Date().setHours(0, 0, 0, 0)) {
        setError('Date cannot be in the past');
        handleDateSelect(undefined);
      } else {
        handleDateSelect(parsedDate);
        setError('');
      }
    } else if (value.length === 10) {
      setError('Invalid date');
    } else {
      setError('');
      handleDateSelect(undefined);
    }
  };

  return <div className={`flex flex-col rounded-xl p-6 shadow-2xl`}>
    <div className="flex gap-2 items-end mb-6">
      <p className="text-2xl font-medium">₱{formatPrice(rate)}</p>
      <span>hour</span>
    </div>
    <div className={`${error ? 'border-2 border-red-400 rounded-xl' : ''}`}>
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex flex-col relative">
            <Input
              type="text"
              placeholder="mm/dd/yyyy"
              value={inputDate}
              onChange={handleInputChange}
              maxLength={10}
              className="flex-grow px-4 md:px-32 pt-10 pb-4 md:py-8 text-base border-t-gray-900 border-x-gray-900 border-b-0 rounded-t-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none"
            />
            <span className={`absolute top-2 left-4 text-xs font-medium uppercase transform origin-top-right flex gap-4 ${error ? 'text-red-400' : 'text-gray-900'}`}>Date</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-full p-4 rounded-2xl shadow-2xl">
          <SingleCalendar
            selectedDate={selectedDate}
            onSelect={(date: Date | undefined) => {
              handleDateSelect(date);
              if (date) {
                setInputDate(
                  date.toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                  })
                );
              }
            }}
            clearSelectedDate={() => {
              clearDate();
              setInputDate('');
            }}
            bookings={bookingData || []}
            userId={user?.id || ''}
          />
        </PopoverContent>
      </Popover>
      <div className="flex flex-col relative">
        <DynamicInput
          value={description}
          onSubmit={() => { }}
          onChange={handleChange}
          placeholder="Describe your problem here"
          className="flex-grow px-4 pt-10 pb-3 border min-h-20 border-gray-900 text-gray-900 text-sm placeholder:text-gray-400 placeholder:text-xs focus:outline-none focus:ring-none"
        />
        <div className={`absolute top-2 left-4 transform origin-top-right flex gap-4 ${error ? 'text-red-400' : 'text-gray-900'}`}>
          <span className="text-xs font-medium uppercase">Description</span>
          <span className="text-xs text-gray-400">At least 5 characters</span>
        </div>
      </div>
      {/* Number of items */}
      <div className="flex justify-between items-center relative px-4 pt-8 pb-2 border border-x-gray-900 border-b-gray-900 rounded-b-xl">
        <p className="text-sm">{quantity} {(quantity > 1) ? 'items' : 'item'}</p>
        <div className="flex justify-center items-center gap-4">
          <Minus
            className="border border-gray-400 rounded-full h-8 w-8 flex items-center justify-center active:scale-[0.98] transition duration-75 bg-transparent p-2 cursor-pointer hover:border-gray-900 hover:text-gray-900"
            onClick={() => {
              if (quantity > 1) {
                setQuantity(quantity - 1);
              }
            }}
          />
          <span>{quantity}</span>
          <Plus
            className="border border-gray-400 rounded-full h-8 w-8 flex items-center justify-center active:scale-[0.98] transition duration-75 bg-transparent p-2 cursor-pointer hover:border-gray-900 hover:text-gray-900"
            onClick={() => setQuantity(quantity + 1)}
          />
        </div>
        <span className={`absolute top-2 left-4 text-xs font-medium uppercase transform origin-top-right flex gap-4 ${error ? 'text-red-400' : 'text-gray-900'}`}>Quantity</span>
      </div>
    </div>
    <Button
      className="py-7 mt-6 text-sm font-medium text-white rounded-xl bg-yellow-500 hover:bg-yellow-500 active:scale-[0.98] transition duration-75"
      onClick={handleSubmit}
    >
      Book Now
    </Button>
    <p className="text-xs text-gray-600 mt-4 text-center">{`You won't be charged until the booking is confirmed.`}</p>
  </div>;
}

