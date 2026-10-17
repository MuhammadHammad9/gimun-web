'use client';
import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { signOutEverywhere } from './user-actions';
import { useConfirm } from './ui/ConfirmDialog';
import { useNotice } from './ui/Notice';

/** Ends the admin's sessions on every device, then returns to the sign-in page. */
export function SignOutEverywhere({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  const [confirm, dialog] = useConfirm();
  const notice = useNotice();
  return <>
    {dialog}
    <button type="button" className="secondary" disabled={pending} onClick={async () => {
      if (!(await confirm({ title: 'Sign out everywhere?', body: 'Every browser and phone where you are signed in, including this one, has to sign in again. Use this if you left a session open somewhere.', confirmLabel: 'Sign out everywhere' }))) return;
      start(async () => {
        const result = await signOutEverywhere(userId);
        if (result.error) { notice({ text: result.error, tone: 'error' }); return; }
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a full load drops every bit of the signed-out session's page state
        window.location.assign('/admin/login');
      });
    }}><LogOut size={14} aria-hidden="true" /> Sign out everywhere</button>
  </>;
}
