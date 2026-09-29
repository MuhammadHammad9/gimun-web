import Link from 'next/link';
export default function NotFound(){return <section className="admin-card"><h1>Record not found</h1><p>This record may have moved or is no longer available.</p><Link href="/admin">Return to overview</Link></section>;}
