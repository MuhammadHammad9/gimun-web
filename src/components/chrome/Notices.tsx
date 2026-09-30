'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BellRing, CalendarClock, WifiOff, Wifi } from 'lucide-react';
import { useSiteConfig } from '@/components/SiteConfigProvider';
import { firstIntent, whenIdle } from '@/lib/motion/gates';
import { isKnownPublicPath } from '@/lib/motion/routes';
import { deadlineReminders, reminderTitle } from '@/lib/notices';
import { formatEventDate } from '@/lib/site-config';
import type { SwipeToastProps } from '@/components/reactbits/SwipeToast';

/** The announcement the visitor may not have seen yet. */
export interface LatestNotice {
  id: string;
  title: string;
  timestamp: string;
  /** True when the notice bar is already showing this one. */
  inBanner: boolean;
}

interface Notice {
  key: string;
  icon: 'deadline' | 'news' | 'offline' | 'online';
  title: string;
  description?: string;
  action?: { label: string; href: string };
  /** 0 keeps it up until it is dismissed or replaced. */
  duration: number;
}

const DAY = 86_400_000;
const NEWS_WITHIN_DAYS = 7;
const SEEN_KEY = 'gimun_announcements_seen_at';

const read = (store: Storage | undefined, key: string) => {
  try {
    return store?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const write = (store: Storage | undefined, key: string, value: string) => {
  try {
    store?.setItem(key, value);
  } catch {
    // Private windows can refuse storage; the notice then shows again next visit.
  }
};

/**
 * Important notices for the visitor, one at a time, as a toast in the corner:
 *
 *  - a registration deadline within two weeks (once a visit, per track, and
 *    never on the register page itself);
 *  - an announcement published since the visitor last looked (from the last
 *    week, and not the one the notice bar already shows);
 *  - losing and regaining the connection.
 *
 * Deadline and news toasts wait for the visitor's first intent, so nothing
 * appears (or loads) during first paint; the toast component and its motion
 * library load only when there is something to say. Each toast is a polite
 * live region, pauses while hovered or focused, and closes with Escape, a
 * swipe down or its close button.
 */
export function Notices({ latest }: { latest?: LatestNotice }) {
  const site = useSiteConfig();
  const path = usePathname();
  const router = useRouter();
  const [queue, setQueue] = useState<Notice[]>([]);
  const [Toast, setToast] = useState<ComponentType<SwipeToastProps> | null>(null);
  const [open, setOpen] = useState(true);
  const shown = useRef(new Set<string>());
  const publicPage = isKnownPublicPath(path) && !path.startsWith('/admin');

  const push = (notice: Notice) => {
    if (shown.current.has(notice.key)) return;
    shown.current.add(notice.key);
    // A connection notice replaces the other one; everything else queues.
    const connection = (icon: Notice['icon']) => icon === 'offline' || icon === 'online';
    setQueue((current) => [...current.filter((item) => !(connection(notice.icon) && connection(item.icon))), notice]);
  };

  // Visiting the announcements marks everything up to now as seen.
  useEffect(() => {
    if (path.startsWith('/announcements')) write(globalThis.localStorage, SEEN_KEY, new Date().toISOString());
  }, [path]);

  // Deadlines and news, after the first intent.
  useEffect(() => {
    if (!publicPage) return;
    let cancelled = false;
    firstIntent().then(() => {
      if (cancelled) return;
      const now = Date.now();
      if (!path.startsWith('/register')) {
        for (const reminder of deadlineReminders(site, now)) {
          const key = `notice-deadline-${reminder.track}-${reminder.deadline}`;
          if (read(globalThis.sessionStorage, key)) continue;
          write(globalThis.sessionStorage, key, '1');
          push({
            key,
            icon: 'deadline',
            title: reminderTitle(reminder),
            description: `The deadline is ${formatEventDate(reminder.deadline)}, 11:59 pm Pakistan time.`,
            action: { label: 'Register', href: reminder.href },
            duration: 9000,
          });
        }
      }
      // Fetch the toast quietly once the visitor is here and the page is
      // idle, so a notice can still show if the connection drops later.
      whenIdle().then(() => import('@/components/reactbits/SwipeToast')).catch(() => undefined);
      if (latest && !path.startsWith('/announcements')) {
        const published = new Date(latest.timestamp).getTime();
        const seenAt = new Date(read(globalThis.localStorage, SEEN_KEY) ?? 0).getTime();
        const bannerShowing = latest.inBanner && document.documentElement.dataset.bannerDismissed !== '1';
        if (published > seenAt && now - published < NEWS_WITHIN_DAYS * DAY && !bannerShowing) {
          write(globalThis.localStorage, SEEN_KEY, new Date(now).toISOString());
          push({
            key: `notice-news-${latest.id}`,
            icon: 'news',
            title: 'New announcement',
            description: latest.title,
            action: { label: 'Read', href: `/announcements#${latest.id}` },
            duration: 8000,
          });
        }
      }
    });
    return () => {
      cancelled = true;
    };
    // Re-evaluated on navigation; each notice shows once (see `shown`).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, publicPage]);

  // Connection lost and back.
  useEffect(() => {
    const offline = () =>
      push({
        key: `notice-offline-${Date.now()}`,
        icon: 'offline',
        title: "You're offline",
        description: 'Anything you have typed stays on this page. Send it once you are back online.',
        duration: 0,
      });
    const online = () => {
      setQueue((current) => current.filter((item) => item.icon !== 'offline'));
      push({ key: `notice-online-${Date.now()}`, icon: 'online', title: 'Back online', duration: 3500 });
    };
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => {
      window.removeEventListener('offline', offline);
      window.removeEventListener('online', online);
    };
     
  }, []);

  // The toast (and motion) load only once there is something to show.
  const current = queue[0];
  useEffect(() => {
    if (!current || Toast) return;
    let cancelled = false;
    import('@/components/reactbits/SwipeToast')
      .then((module) => {
        if (!cancelled) setToast(() => module.default);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [current, Toast]);

  if (!current || !Toast || !publicPage) return null;

  const Icon = { deadline: CalendarClock, news: BellRing, offline: WifiOff, online: Wifi }[current.icon];
  const next = () => {
    setOpen(false);
    window.setTimeout(() => {
      setQueue((items) => items.slice(1));
      setOpen(true);
    }, 250);
  };

  return (
    <Toast
      key={current.key}
      className="site-toast"
      open={open}
      title={current.title}
      description={current.description}
      icon={<Icon strokeWidth={1.75} />}
      actionLabel={current.action?.label}
      onAction={current.action ? () => router.push(current.action!.href) : undefined}
      closeButton
      duration={current.duration}
      width={380}
      radius={16}
      onClose={next}
    />
  );
}
