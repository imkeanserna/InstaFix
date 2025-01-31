"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { TooltipProvider } from './tooltip';

export const Calendar = ({
  selectedDate,
  onSelect,
  disabled,
  clearSelectedDate
}: {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
  disabled: (date: Date) => boolean;
  clearSelectedDate: () => void
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  return (
    <Card className="w-full max-w-sm border-0 shadow-none">
      <CardHeader className="space-y-1.5">
        <CardTitle>
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
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(firstDayOfMonth)].map((_, index) => (
            <div key={`empty-${index}`} className="h-8" />
          ))}
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const isDisabled = isPastDate(day);
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isBooked = disabled(date);

            return (
              <TooltipProvider key={day}>
                <div className="relative">
                  {isBooked && !isDisabled && (
                    <div className="absolute -top-3 text-center transform  origin-top-right">
                      <span className="text-[9px] bg-gray-200 text-gray-600 px-1 rounded">
                        Booked
                      </span>
                    </div>
                  )}
                  {isSelectedDate(day)
                    ?
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            variant="default"
                            className="h-11 w-11 rounded-full active:scale-90 bg-yellow-500 text-white hover:bg-yellow-500"
                            onClick={() => handleDateClick(day)}
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
                    :
                    <Button
                      variant={isSelectedDate(day) ? "default" : "ghost"}
                      className={`h-11 w-full rounded-full active:scale-90
                    ${isSelectedDate(day) ? 'bg-yellow-500 text-white hover:bg-yellow-600' : ''} 
                    ${isDisabled ? 'opacity-50 cursor-not-allowed line-through' : ''}
                  `}
                      onClick={() => handleDateClick(day)}
                      disabled={isDisabled || isBooked}
                    >
                      {day}
                    </Button>
                  }
                </div>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
      <div className='w-full flex justify-end'>
        <Button variant="ghost" className="underline rounded-xl active:scale-90" onClick={clearSelectedDate}>
          Clear Dates
        </Button>
      </div>
    </Card>
  );
};
