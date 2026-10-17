'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

type NoticeInput = { text: string; tone?: 'success' | 'error'; action?: { label: string; run: () => void | Promise<void> } };
type Notice = NoticeInput & { id: number };
const NoticeContext = createContext<(notice: NoticeInput) => void>(() => {});

/** Short messages after an action, read out to screen readers, with an optional Undo. */
export function useNotice() {
  return useContext(NoticeContext);
}

export function NoticeProvider({ children }: { children: ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const next = useRef(0);
  const dismiss = useCallback((id: number) => setNotices((list) => list.filter((n) => n.id !== id)), []);
  const show = useCallback((notice: NoticeInput) => {
    const id = ++next.current;
    setNotices((list) => [...list.slice(-2), { ...notice, id }]);
  }, []);
  return <NoticeContext.Provider value={show}>
    {children}
    <div className="admin-notices" role="status" aria-live="polite">
      {notices.map((n) => <NoticeItem key={n.id} notice={n} onDismiss={() => dismiss(n.id)} />)}
    </div>
  </NoticeContext.Provider>;
}

function NoticeItem({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  // A notice with an action stays longer, so there is time to use Undo.
  useEffect(() => { const t = setTimeout(onDismiss, notice.action ? 10000 : 5000); return () => clearTimeout(t); }, [notice.action, onDismiss]);
  const Icon = notice.tone === 'error' ? XCircle : CheckCircle2;
  return <div className={`admin-notice ${notice.tone === 'error' ? 'is-error' : ''}`}>
    <Icon size={16} aria-hidden="true" />
    <span>{notice.text}</span>
    {notice.action && <button type="button" className="admin-link-button" onClick={async () => { onDismiss(); await notice.action!.run(); }}>{notice.action.label}</button>}
    <button type="button" className="admin-notice__close" aria-label="Dismiss" onClick={onDismiss}><X size={14} aria-hidden="true" /></button>
  </div>;
}
