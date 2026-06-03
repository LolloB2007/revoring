/**
 * Vercel Blob helpers for media (product / blog images).
 *
 * Token discovery: when you connect a Vercel Blob store to a project, the
 * Marketplace integration picks an env var name. The default is
 * `BLOB_READ_WRITE_TOKEN`, but if the store wasn't the first one in the
 * account it gets prefixed (e.g. `revoring_blob_READ_WRITE_TOKEN`). We scan
 * the env at runtime for any `*READ_WRITE_TOKEN` matching the Vercel Blob
 * token format (`vercel_blob_rw_...`) and use that, so the user doesn't have
 * to manually rename the variable.
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

/**
 * Find a Vercel Blob read-write token in the environment regardless of the
 * exact env var name. Tries:
 *   1. Conventional name `BLOB_READ_WRITE_TOKEN`
 *   2. Any env var ending in `_READ_WRITE_TOKEN` whose value starts with
 *      `vercel_blob_rw_` (the unmistakable Blob token prefix)
 * Returns undefined if none found.
 */
export function findBlobToken(): string | undefined {
  const direct = process.env.BLOB_READ_WRITE_TOKEN;
  if (direct && direct.startsWith("vercel_blob_rw_")) return direct;
  for (const [k, v] of Object.entries(process.env)) {
    if (!v) continue;
    if (!k.endsWith("READ_WRITE_TOKEN")) continue;
    if (v.startsWith("vercel_blob_rw_")) return v;
  }
  return undefined;
}

export async function uploadToBlob(input: {
  pathname: string;
  body: Blob | string | Buffer;
  contentType: string;
}): Promise<{ url: string; pathname: string }> {
  if (!isAllowedContentType(input.contentType)) {
    throw new Error(`Unsupported content type: ${input.contentType}`);
  }
  const token = findBlobToken();
  const blob = await put(input.pathname, input.body, {
    access: "public",
    contentType: input.contentType,
    addRandomSuffix: true,
    token,
  });
  return { url: blob.url, pathname: blob.pathname };
}

export async function deleteBlob(url: string): Promise<void> {
  await del(url, { token: findBlobToken() });
}

export async function headBlob(url: string) {
  return head(url, { token: findBlobToken() });
}
