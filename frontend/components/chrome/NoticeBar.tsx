import { TransitionLink as Link } from '@frontend/components/motion/TransitionLink';
import type { Announcement } from '@shared/lib/types';
import { DismissNotice } from './DismissNotice';

/** localStorage key recording that a visitor closed this notice. */
export function noticeStorageKey(announcement: Announcement): string {
  return `gimun_announcement_dismissed_${announcement.id}_${announcement.publicationVersion ?? announcement.timestamp}`;
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
        <DismissNotice storageKey={noticeStorageKey(announcement)} />
      </div>
    </aside>
  );
}
