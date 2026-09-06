import type { Metadata } from 'next';
import { getSchedule } from '@/lib/content';
import { ScheduleClient } from './ScheduleClient';

export const metadata: Metadata = {
  title: 'Unified Itinerary & Schedule | GIMUN & GIKI Moot Cup 2026',
  description:
    'Full 3-day chronological agenda across GIMUN committee debates, Moot Court appellate advocacy rounds, and official institutional ceremonies at GIKI.',
};

export default function SchedulePage() {
  const schedule = getSchedule();
  return <ScheduleClient initialSchedule={schedule} />;
}
