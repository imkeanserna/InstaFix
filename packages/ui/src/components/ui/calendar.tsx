"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { TooltipProvider } from './tooltip';
import { TypedBooking } from "@repo/types";

export const SingleCalendar = ({
  selectedDate,
  onSelect,
  clearSelectedDate,
  bookings,
  userId
}: {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  clearSelectedDate: () => void;
  bookings: TypedBooking[] | undefined;
  userId: string | undefined
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isPastDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date < today;
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    if (newDate.getMonth() >= today.getMonth() || newDate.getFullYear() > today.getFullYear()) {
      setCurrentDate(newDate);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleDateClick = (day: number) => {
    if (!isPastDate(day)) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onSelect(newDate);
    }
  };

  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const showPrevButton = () => {
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return prevMonthDate.getMonth() >= today.getMonth() || prevMonthDate.getFullYear() > today.getFullYear();
  };

  const isDateBooked = (date: Date) => {
    if (!bookings) return false;
    return bookings?.some(booking => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isBookedByCurrentUser = (date: Date) => {
    if (!bookings || !userId) return false;
    return bookings?.some(booking => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear() &&
        booking.client.id === userId
      );
    });
  };

  return (
    <Card className="w-full max-w-sm border-0 shadow-none">
      <CardHeader className="space-y-1.5 px-0">
        <CardTitle className='space-y-6'>
          <div className='space-y-1'>
            <p className='text-xl font-medium'>Select date to book</p>
            <p className='text-sm font-normal text-gray-500'>
              {selectedDate
                ?
                selectedDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                :
                "Choose your dates to schedule your project"
              }
            </p>
          </div>
          <div className="flex items-center justify-between">
            {showPrevButton() && (
              <Button
                variant="ghost"
                size="icon"
                onClick={prevMonth}
                className='rounded-full'
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {!showPrevButton() && <div className="w-9" />}
            <span className="text-base font-medium">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className='rounded-full'
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className='w-full p-0'>
        <CalendarMonth
          currentDate={currentDate}
          handleDateClick={handleDateClick}
          isPastDate={isPastDate}
          isDateBooked={isDateBooked}
          isBookedByCurrentUser={isBookedByCurrentUser}
          isSelectedDate={isSelectedDate}
        />
      </CardContent>
      {selectedDate && (
        <div className='w-full flex justify-end'>
          <Button variant="ghost" className="underline rounded-xl active:scale-90" onClick={clearSelectedDate}>
            Clear Dates
          </Button>
        </div>
      )}
    </Card>
  );
};

export const DualCalendar = ({
  selectedDate,
  onSelect,
  clearSelectedDate,
  bookings,
  userId
}: {
  selectedDate: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  clearSelectedDate: () => void;
  bookings: TypedBooking[] | undefined;
  userId: string | undefined;
}) => {
  const [leftDate, setLeftDate] = useState(new Date());
  const rightDate = new Date(leftDate.getFullYear(), leftDate.getMonth() + 1, 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const isPastDate = (day: number, currentDate: Date) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return date < today;
  };

  const prevMonth = () => {
    const newDate = new Date(leftDate.getFullYear(), leftDate.getMonth() - 1, 1);
    if (newDate.getMonth() >= today.getMonth() || newDate.getFullYear() > today.getFullYear()) {
      setLeftDate(newDate);
    }
  };

  const nextMonth = () => {
    setLeftDate(new Date(leftDate.setMonth(leftDate.getMonth() + 1)));
  };

  const handleDateClick = (day: number, currentDate: Date) => {
    if (!isPastDate(day, currentDate)) {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      onSelect(newDate);
    }
  };

  const isSelectedDate = (day: number, currentDate: Date) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const showPrevButton = () => {
    const prevMonthDate = new Date(leftDate.getFullYear(), leftDate.getMonth() - 1, 1);
    return prevMonthDate.getMonth() >= today.getMonth() || prevMonthDate.getFullYear() > today.getFullYear();
  };

  const isDateBooked = (date: Date) => {
    if (!bookings) return false;
    return bookings?.some(booking => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isBookedByCurrentUser = (date: Date) => {
    if (!bookings || !userId) return false;
    return bookings?.some(booking => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear() &&
        booking.client.id === userId
      );
    });
  };

  return (
    <Card className="w-full max-w-3xl border-0 shadow-none">
      <CardHeader className="space-y-1.5 px-0">
        <CardTitle className="space-y-6">
          <div className="space-y-1">
            <p className="text-xl font-medium">Select date to book</p>
            <p className="text-sm font-normal text-gray-500">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : "Choose your dates to schedule your project"
              }
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-24 items-center">
              {showPrevButton() && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMonth}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="text-base font-medium">
                {monthNames[leftDate.getMonth()]} {leftDate.getFullYear()}
              </span>
            </div>
            <div className="flex gap-24 items-center">
              <span className="text-base font-medium">
                {monthNames[rightDate.getMonth()]} {rightDate.getFullYear()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-8">
          <CalendarMonth
            currentDate={leftDate}
            handleDateClick={handleDateClick}
            isPastDate={isPastDate}
            isDateBooked={isDateBooked}
            isBookedByCurrentUser={isBookedByCurrentUser}
            isSelectedDate={isSelectedDate}
          />
          <CalendarMonth
            currentDate={rightDate}
            handleDateClick={handleDateClick}
            isPastDate={isPastDate}
            isDateBooked={isDateBooked}
            isBookedByCurrentUser={isBookedByCurrentUser}
            isSelectedDate={isSelectedDate}
          />
        </div>
      </CardContent>
      {selectedDate && (
        <div className="w-full flex justify-end">
          <Button variant="ghost" className="underline rounded-xl active:scale-90" onClick={clearSelectedDate}>
            Clear Dates
          </Button>
        </div>
      )}
    </Card>
  );
};

const CalendarMonth = ({
  currentDate,
  handleDateClick,
  isPastDate,
  isDateBooked,
  isBookedByCurrentUser,
  isSelectedDate,
}: {
  currentDate: Date;
  handleDateClick: (day: number, date: Date) => void;
  isPastDate: (day: number, date: Date) => boolean;
  isDateBooked: (date: Date) => boolean;
  isBookedByCurrentUser: (date: Date) => boolean;
  isSelectedDate: (day: number, date: Date) => boolean;
}) => {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...Array(firstDayOfMonth)].map((_, index) => (
          <div key={`empty-${index}`} className="h-full w-full" />
        ))}
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const isDisabled = isPastDate(day, currentDate);
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const isBooked = isDateBooked(date);
          const isUserBooking = isBookedByCurrentUser(date);

          return (
            <TooltipProvider key={day}>
              <div className="relative aspect-square w-full">
                {isBooked && !isDisabled && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-center">
                    <span className={`${isUserBooking ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'} text-[9px] px-1 rounded`}>
                      {isUserBooking ? 'Booked' : 'Reserved'}
                    </span>
                  </div>
                )}
                {isSelectedDate(day, currentDate) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="default"
                          className="h-12 w-12 rounded-full active:scale-90 bg-yellow-500 text-white hover:bg-yellow-500"
                          onClick={() => handleDateClick(day, currentDate)}
                          disabled={isDisabled || isBooked}
                        >
                          {day}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="flex justify-center bg-yellow-500 shadow-lg rounded-lg border border-gray-300 px-2 py-1 mb-2 ms-12">
                      <p className="inline text-sm text-white">Booking day!</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className={`h-12 w-12 rounded-full active:scale-90
                      ${isDisabled ? 'opacity-50 cursor-not-allowed line-through' : ''}
                    `}
                    onClick={() => handleDateClick(day, currentDate)}
                    disabled={isDisabled || isBooked}
                  >
                    {day}
                  </Button>
                )}
              </div>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};
