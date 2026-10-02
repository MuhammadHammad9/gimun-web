'use client';

import { createBrowserClient } from '@supabase/ssr';
import { abandonUpload, finishUpload, startUpload, type UploadedMedia } from './media-actions';

export const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp';
export const ACCEPTED_FILES = `${ACCEPTED_IMAGES},application/pdf`;
const LIMIT_MB = { image: 5, pdf: 25 };

/** A description from a file name: "team-photo_2027.jpg" -> "Team photo 2027". */
export function describeFile(name: string): string {
  const base = name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return base ? base[0].toUpperCase() + base.slice(1) : 'Uploaded file';
}

/** Checks a file before any network work, with a message a person can act on. */
export function checkFile(file: File, accept = ACCEPTED_FILES): string | null {
  if (!accept.split(',').includes(file.type)) return `${file.name}: use a JPEG, PNG or WebP image${accept.includes('pdf') ? ', or a PDF' : ''}.`;
  const limit = file.type === 'application/pdf' ? LIMIT_MB.pdf : LIMIT_MB.image;
  if (file.size > limit * 1024 * 1024) return `${file.name} is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is ${limit} MB${file.type === 'application/pdf' ? '' : '; resize or export it smaller'}.`;
  return null;
}

let client: ReturnType<typeof createBrowserClient> | null = null;
function storage() {
  client ??= createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
  return client.storage.from('media');
}

/**
 * Uploads one file the verified way: the server signs an upload and records it
 * as pending, the browser sends the bytes straight to storage, and the server
 * checks the stored size and type before the file becomes usable. A failed
 * upload is cleaned up so no half-finished file is left behind.
 */
export async function uploadFile(file: File, alt: string): Promise<UploadedMedia> {
  const problem = checkFile(file);
  if (problem) throw new Error(problem);
  const upload = await startUpload({ mime: file.type, size: file.size, alt: alt.trim() || describeFile(file.name) });
  if ("error" in upload) throw new Error(upload.error);
  const { error } = await storage().uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
  if (error) {
    await abandonUpload(upload.path);
    throw new Error(`${file.name} could not be sent to storage: ${error.message || "check your connection and try again"}.`);
  }
  const done = await finishUpload(upload.path);
  if ("error" in done) throw new Error(done.error);
  return done;
}
