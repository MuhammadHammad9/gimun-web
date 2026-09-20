import { requireAdmin } from '@/lib/server/admin/auth';
import { AuthForm } from '../AuthForm';
export default async function PasswordPage() { await requireAdmin(true); return <AuthForm passwordOnly />; }
