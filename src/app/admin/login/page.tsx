import { AuthForm } from '../AuthForm';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string | string[] }> }) {
  const { reason } = await searchParams;
  return <AuthForm reason={Array.isArray(reason) ? reason[0] : reason} />;
}
