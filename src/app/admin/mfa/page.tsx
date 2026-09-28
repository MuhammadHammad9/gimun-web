import { redirect } from 'next/navigation';
import { authClient, mfaState, requireAdmin } from '@/lib/server/admin/auth';
import { MfaForm } from '../MfaForm';
export default async function MfaPage() {
  await requireAdmin(true, true);
  const state = await mfaState();
  if (!state.needsCode && !state.needsEnrolment) {
    // Voluntary enrolment for accounts that already passed the gate.
    const { data } = await (await authClient()).auth.mfa.listFactors();
    if (data?.totp.some((f) => f.status === 'verified')) redirect('/admin');
  }
  return <MfaForm mode={state.needsCode ? 'code' : 'enrol'} />;
}
