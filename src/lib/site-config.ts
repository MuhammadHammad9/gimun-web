import siteConfig from '../../content/site.json';
import type { SiteConfig } from './types';

const DEFAULT_SITE_URL = 'https://gimungiki.org';

export function getSiteUrl() {
  return (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}

export function getAnalyticsMeasurementId() {
  const value = process.env.ANALYTICS_MEASUREMENT_ID?.trim();
  return value && /^G-[A-Z0-9]+$/i.test(value) ? value : undefined;
}

export function getEventYear() {
  return siteConfig.eventDates.start.slice(0, 4);
}

export function isRegistrationDeadlinePassed(deadline: string, now = Date.now()) {
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
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
    ...options,
  }).format(new Date(`${date}T12:00:00+05:00`));
}

export function formatEventMonth(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(`${date}T12:00:00+05:00`));
}

export function formatScheduleDay(date: string) {
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
