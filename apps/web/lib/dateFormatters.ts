import { differenceInDays, differenceInMinutes, format, formatDistanceToNow, isThisWeek, isToday, isYesterday } from "date-fns";

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

export const calculateRemainingDays = (createdAt: Date, maxDays: number = 3) => {
  const createdDate = new Date(createdAt);
  const deadlineDate = new Date(createdDate.getTime() + (maxDays * 24 * 60 * 60 * 1000));
  const remainingDays = differenceInDays(deadlineDate, new Date());
  return Math.max(0, remainingDays);
};

export const chatFormattedTime = (date: Date): string => {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

export function formatMessageDate(date: Date): string {
  const today = new Date();
  const messageDate = new Date(date);

  // Check if the date is today
  if (
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear()
  ) {
    return 'Today';
  }

  // Check if the date is yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (
    messageDate.getDate() === yesterday.getDate() &&
    messageDate.getMonth() === yesterday.getMonth() &&
    messageDate.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // Otherwise, return formatted date
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(messageDate);
}
