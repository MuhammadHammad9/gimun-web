import type { Metadata } from 'next';
import './admin.css';
export const metadata: Metadata = { title: 'Event administration', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export default function AdminLayout({ children }: { children: React.ReactNode }) { return <div className="admin min-h-screen p-4 sm:p-8">{children}</div>; }
