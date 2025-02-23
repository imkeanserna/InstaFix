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
