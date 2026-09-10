import siteConfig from '../../content/site.json';
import type { SiteConfig } from './types';

const DEFAULT_SITE_URL = 'https://gimungiki.org';

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getSiteUrl() {
  const configuredUrl = process.env.SITE_URL?.trim();
  if (process.env.VERCEL_ENV === 'production' && !configuredUrl) {
    throw new Error('SITE_URL is required for the production deployment.');
  }

  const candidate = configuredUrl || DEFAULT_SITE_URL;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('SITE_URL must be an absolute HTTP(S) URL.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('SITE_URL must be an absolute HTTP(S) URL.');
  }
  if (process.env.VERCEL_ENV === 'production' && parsed.protocol !== 'https:') {
    throw new Error('SITE_URL must use HTTPS in the production deployment.');
  }

  return parsed.origin;
}

export function getAnalyticsMeasurementId() {
  const value = process.env.ANALYTICS_MEASUREMENT_ID?.trim();
  return value && /^G-[A-Z0-9]+$/i.test(value) ? value : undefined;
}

export function getEventYear() {
  const value = (siteConfig as Partial<SiteConfig>).eventDates?.start;
  return typeof value === 'string' && /^\d{4}-/.test(value) ? value.slice(0, 4) : 'unknown';
}

export function isRegistrationDeadlinePassed(deadline: string, now = Date.now()) {
  if (!isValidIsoDate(deadline)) return true;
  const deadlineAt = new Date(`${deadline}T23:59:59+05:00`).getTime();
  return !Number.isFinite(deadlineAt) || now > deadlineAt;
}

export function getCanonicalEventDateRange() {
  const config = siteConfig as SiteConfig;
  return `${formatEventDate(config.eventDates.start)}–${formatEventDate(config.eventDates.end, { day: 'numeric' })}`;
}

export function getCanonicalVenue() {
  return (siteConfig as SiteConfig).venue;
}

export function formatEventDate(date: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!isValidIsoDate(date)) return date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
    ...options,
  }).format(new Date(`${date}T12:00:00+05:00`));
}

export function formatEventMonth(date: string) {
  if (!isValidIsoDate(date)) return date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(`${date}T12:00:00+05:00`));
}

export function formatScheduleDay(date: string) {
  if (!isValidIsoDate(date)) return date;
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(`${date}T12:00:00+05:00`));
}

export function formatPublishedDate(timestamp: string) {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return 'Date unavailable';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(date);
}
