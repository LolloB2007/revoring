/**
 * Vercel Blob helpers for media (product / blog images).
 *
 * Why Blob and not R2: same file-storage outcome, one fewer vendor to wire up,
 * and the Vercel Marketplace integration auto-injects BLOB_READ_WRITE_TOKEN.
 *
 * Upload flow: client uploads directly to Blob (bypasses our serverless
 * function, no 4.5 MB body limit), the API route here just mints a short-lived
 * token + validates the content type.
 */
import { put, del, head } from "@vercel/blob";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 10 * 1024 * 1024;

export const BLOB_LIMITS = {
  allowedContentTypes: Array.from(ALLOWED_MIME),
  maximumSizeInBytes: MAX_BYTES,
} as const;

export function isAllowedContentType(t: string): boolean {
  return ALLOWED_MIME.has(t);
}

export async function uploadToBlob(input: {
  pathname: string;
  body: Blob | string | Buffer;
  contentType: string;
}): Promise<{ url: string; pathname: string }> {
  if (!isAllowedContentType(input.contentType)) {
    throw new Error(`Unsupported content type: ${input.contentType}`);
  }
  const blob = await put(input.pathname, input.body, {
    access: "public",
    contentType: input.contentType,
    addRandomSuffix: true,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}

export async function headBlob(url: string) {
  return head(url);
}
