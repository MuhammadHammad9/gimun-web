import { TransitionLink as Link } from '@/components/motion/TransitionLink';
import type { Announcement } from '@/lib/types';
import { DismissNotice } from './DismissNotice';

/** localStorage key recording that a visitor closed this notice. */
export function noticeStorageKey(id: string): string {
  return `gimun_announcement_dismissed_${id}`;
}

/**
 * Runs in <head> before first paint: a visitor who already closed this
 * notice never sees it appear and then vanish.
 */
export function noticeBootScript(announcement?: Announcement): string {
  if (!announcement) return '';
  const key = JSON.stringify(noticeStorageKey(announcement.id)).replace(/</g, '\\u003c');
  return `try{if(localStorage.getItem(${key})==='true')document.documentElement.dataset.bannerDismissed='1'}catch(e){}`;
}

/** The pinned or latest notice, as a slim strip above the header. */
export function NoticeBar({ announcement }: { announcement?: Announcement }) {
  if (!announcement?.title) return null;
  const href = announcement.actionUrl || `/announcements#${announcement.id}`;
  return (
    <aside data-announcement-banner="" aria-label="Site announcement" className="notice-bar tone-crest">
      <div className="notice-bar__inner">
        <span className="notice-bar__dot" aria-hidden="true" />
        <span className="notice-bar__message" title={announcement.title}>
          {announcement.title}
        </span>
        <Link href={href} className="notice-bar__link">
          Read notice
        </Link>
        <DismissNotice storageKey={noticeStorageKey(announcement.id)} />
      </div>
    </aside>
  );
}
