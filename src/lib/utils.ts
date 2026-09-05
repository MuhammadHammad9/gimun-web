import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  return timeString;
}

export function formatDateRange(startStr?: string, endStr?: string): string {
  if (!startStr) return 'November 13–15, 2026';
  try {
    const start = new Date(startStr);
    if (isNaN(start.getTime())) return startStr;
    const year = start.getFullYear();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();

    if (!endStr) {
      return `${startMonth} ${startDay}, ${year}`;
    }

    const end = new Date(endStr);
    if (isNaN(end.getTime())) return `${startMonth} ${startDay}, ${year}`;
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  } catch {
    return startStr;
  }
}
