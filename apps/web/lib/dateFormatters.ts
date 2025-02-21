"use client";

import { differenceInMinutes, format, formatDistanceToNow, isThisWeek, isToday, isYesterday } from "date-fns";

export const getTimeAgo = (date: Date) => {
  const diffInMinutes = differenceInMinutes(new Date(), date);
  if (diffInMinutes < 2) return 'New';
  return formatDistanceToNow(date, {
    addSuffix: true,
    includeSeconds: false
  }).replace('about', '');
};

export const getFormattedTime = (date: Date): string => {
  if (isToday(date)) return `Today at ${format(date, 'p')}`;
  if (isYesterday(date)) return `Yesterday at ${format(date, 'p')}`;
  if (isThisWeek(date)) return format(date, 'EEEE') + ` at ${format(date, 'p')}`;
  return format(date, 'PPP');
};
