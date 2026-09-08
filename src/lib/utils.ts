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
  if (!startStr) return 'Event dates pending';
  try {
    const start = new Date(`${startStr}T12:00:00+05:00`);
    if (isNaN(start.getTime())) return startStr;
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Karachi',
    });
    const startParts = formatter.formatToParts(start);
    const year = startParts.find((part) => part.type === 'year')?.value || '';
    const startMonth = startParts.find((part) => part.type === 'month')?.value || '';
    const startDay = startParts.find((part) => part.type === 'day')?.value || '';

    if (!endStr) {
      return `${startMonth} ${startDay}, ${year}`;
    }

    const end = new Date(`${endStr}T12:00:00+05:00`);
    if (isNaN(end.getTime())) return `${startMonth} ${startDay}, ${year}`;
    const endParts = formatter.formatToParts(end);
    const endMonth = endParts.find((part) => part.type === 'month')?.value || '';
    const endDay = endParts.find((part) => part.type === 'day')?.value || '';

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
  } catch {
    return startStr;
  }
}
