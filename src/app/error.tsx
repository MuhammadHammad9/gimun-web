'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="mx-auto max-w-xl p-12"><h1 className="text-3xl">This page could not load</h1><p className="my-4">Please try again. Your submitted application is not affected.</p><button onClick={reset} className="rounded bg-white p-3 text-black">Try again</button></section>; }
