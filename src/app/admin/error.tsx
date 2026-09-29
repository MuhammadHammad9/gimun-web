 'use client';
import Link from 'next/link';
export default function Error({reset}:{reset:()=>void}){return <section className="admin-card"><h1>Workspace unavailable</h1><p>This section could not be loaded. Your access may have changed, or the connection is temporarily unavailable.</p><button onClick={reset}>Try again</button><Link href="/admin">Return to overview</Link> · <Link href="/admin/login">Sign in again</Link></section>;}
