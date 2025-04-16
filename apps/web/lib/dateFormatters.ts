import { differenceInDays, differenceInMinutes, format, formatDistanceToNow } from "date-fns";

export const getTimeAgo = (date: Date) => {
  const now = new Date();
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()));
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()));

  const diffInMinutes = differenceInMinutes(utcNow, utcDate);
  if (diffInMinutes < 2) return 'New';

  return formatDistanceToNow(utcDate, {
    addSuffix: true,
    includeSeconds: false
  }).replace('about', '');
};

export const formateDatePosts = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export const getFormattedTime = (date: Date): string => {
  const now = new Date();

  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  // Create a UTC date with time for formatting
  const utcDateTime = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  ));

  // Compare dates for today/yesterday
  const isUtcToday = utcDate.getTime() === utcNow.getTime();

  const utcYesterday = new Date(utcNow);
  utcYesterday.setUTCDate(utcNow.getUTCDate() - 1);
  const isUtcYesterday = utcDate.getTime() === utcYesterday.getTime();

  // For this week, calculate days difference
  const daysDiff = Math.floor((utcNow.getTime() - utcDate.getTime()) / (24 * 60 * 60 * 1000));
  const isUtcThisWeek = daysDiff < 7;

  // Use date-fns format without the timeZone option
  if (isUtcToday) return `Today at ${format(utcDateTime, 'p')}`;
  if (isUtcYesterday) return `Yesterday at ${format(utcDateTime, 'p')}`;
  if (isUtcThisWeek) return format(utcDateTime, 'EEEE') + ` at ${format(utcDateTime, 'p')}`;

  return format(utcDateTime, 'PPP');
};

export const calculateRemainingDays = (createdAt: Date, maxDays: number = 3) => {
  const safeCreatedAt = new Date(createdAt);

  // Normalize to start of the day in UTC
  const utcCreatedDate = new Date(Date.UTC(
    safeCreatedAt.getUTCFullYear(),
    safeCreatedAt.getUTCMonth(),
    safeCreatedAt.getUTCDate()
  ));

  // Calculate deadline by adding max days
  const deadlineDate = new Date(utcCreatedDate.getTime() + (maxDays * 24 * 60 * 60 * 1000));

  // Current date normalized to UTC start of day
  const now = new Date();
  const utcNow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  // Remaining days
  const remainingDays = differenceInDays(deadlineDate, utcNow);
  // Ensure non-negative result
  return Math.max(0, remainingDays);
};

export const chatFormattedTime = (date: Date): string => {
  const now = new Date();
  const utcNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const yesterday = new Date(utcNow);
  yesterday.setUTCDate(utcNow.getUTCDate() - 1);

  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  const isToday = utcDate.getTime() === utcNow.getTime();
  const isYesterday = utcDate.getTime() === yesterday.getTime();

  if (isToday) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }
};

export function formatMessageDate(date: Date): string {
  const now = new Date();
  const utcToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const messageDate = new Date(date);
  const utcMessageDate = new Date(Date.UTC(messageDate.getUTCFullYear(), messageDate.getUTCMonth(), messageDate.getUTCDate()));

  // Check if the date is today in UTC
  if (utcMessageDate.getTime() === utcToday.getTime()) {
    return 'Today';
  }

  // Check if the date is yesterday in UTC
  const utcYesterday = new Date(utcToday);
  utcYesterday.setUTCDate(utcToday.getUTCDate() - 1);

  if (utcMessageDate.getTime() === utcYesterday.getTime()) {
    return 'Yesterday';
  }

  // Return formatted date in UTC
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(messageDate);
}

/**
 * Groups items by date categories (Today, Yesterday, or formatted date)
 * @param items Array of items to group
 * @param dateAccessor Function to extract the date from an item
 * @returns Record with date groups as keys and arrays of items as values
 */
export function groupItemsByDate<T>(
  items: T[],
  dateAccessor: (item: T) => string | number | Date
): Record<string, T[]> {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  const groups: Record<string, T[]> = {};

  items.forEach(item => {
    const itemDate = new Date(dateAccessor(item));
    const itemDay = new Date(Date.UTC(itemDate.getUTCFullYear(), itemDate.getUTCMonth(), itemDate.getUTCDate()));

    let groupKey: string;
    if (itemDay.getTime() === today.getTime()) {
      groupKey = 'Today';
    } else if (itemDay.getTime() === yesterday.getTime()) {
      groupKey = 'Yesterday';
    } else {
      // Format date as Month Day, Year
      groupKey = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(itemDate);
    }

    // Create the group if it doesn't exist
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
  });

  return groups;
}

/**
 * Sorts date group keys in the order: Today, Yesterday, then dates in descending order
 * @param groupKeys Array of group keys to sort
 * @returns Sorted array of group keys
 */
export function sortDateGroupKeys(groupKeys: string[]): string[] {
  return [...groupKeys].sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;

    // Convert date strings back to Date objects for comparison
    // Sort in descending order
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });
}
