import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { BLOB_LIMITS } from "@/lib/blob";

/**
 * Vercel Blob client-upload bridge. Flow:
 *   1. Client calls @vercel/blob/client `upload()` → POSTs to this route to mint a token
 *   2. We verify the admin session + clamp content-type and size
 *   3. We hand back a single-use token; the client streams the file directly
 *      to Blob storage (bypassing this function, so we're not limited by the
 *      4.5 MB body size on Hobby plan)
 */
export async function POST(req: NextRequest) {
  await requireAdmin();

  const body = (await req.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Force every upload into a versioned prefix so we can prune later if needed
        // and so paths don't collide with anything else in the blob store.
        const safe = pathname.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
        const stamped = `revoring/uploads/${Date.now()}-${safe}`;
        return {
          allowedContentTypes: [...BLOB_LIMITS.allowedContentTypes],
          maximumSizeInBytes: BLOB_LIMITS.maximumSizeInBytes,
          addRandomSuffix: true,
          pathname: stamped,
        };
      },
      onUploadCompleted: async () => {
        // Hook for audit / cleanup; intentionally empty for now.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message ?? "upload-failed" },
      { status: 400 },
    );
  }
}
