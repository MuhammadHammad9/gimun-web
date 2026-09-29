'use server';
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

/** Leaves draft preview and shows the same page as visitors see it. */
export async function exitPreview(formData: FormData) {
  (await draftMode()).disable();
  const path = String(formData.get('path') ?? '/');
  // Same-site paths only; "//host" and "/\host" would leave the site.
  redirect(/^\/(?![/\\])/.test(path) ? path : '/');
}
