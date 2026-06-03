import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { BLOB_LIMITS } from "@/lib/blob";

/**
 * Vercel Blob client-upload bridge. Flow:
 *   1. Client calls @vercel/blob/client `upload()` → POSTs to this route
 *   2. We verify the admin session + clamp content-type and size
 *   3. We hand back a single-use token; the client streams the file directly
 *      to Blob storage (bypassing this function, so we're not limited by the
 *      4.5 MB body size on Hobby plan)
 */
export async function POST(req: NextRequest) {
  // 1. Admin gate — must run first so an unauthenticated request can't even
  // probe the upload surface.
  try {
    await requireAdmin();
  } catch (e) {
    console.error("[upload] admin guard rejected:", (e as Error).message);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Vercel must have injected the Blob token. If it didn't, the @vercel/blob
  // call below produces a cryptic error; surface it loudly instead.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("[upload] BLOB_READ_WRITE_TOKEN not set in env");
    return NextResponse.json(
      { error: "blob-not-configured" },
      { status: 500 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch (e) {
    console.error("[upload] body parse failed:", e);
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...BLOB_LIMITS.allowedContentTypes],
        maximumSizeInBytes: BLOB_LIMITS.maximumSizeInBytes,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // Hook for audit / cleanup; intentionally empty for now.
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    // Loud log so the real cause shows up in Vercel runtime logs.
    console.error("[upload] handleUpload threw:", e);
    const msg = (e as Error).message ?? "upload-failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
