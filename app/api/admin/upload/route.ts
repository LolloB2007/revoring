import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { BLOB_LIMITS, isAllowedContentType } from "@/lib/blob";

/**
 * Server-side Vercel Blob upload. Used because our Blob store is connected in
 * OIDC mode (no long-lived read-write token), so the client-upload flow from
 * @vercel/blob/client can't mint tokens. Instead, the browser POSTs the file
 * here and we call put() — @vercel/blob detects OIDC at runtime and signs the
 * upload using VERCEL_OIDC_TOKEN + BLOB_STORE_ID.
 *
 * Hobby plan has a 4.5 MB request-body cap. We enforce 10 MB in code but
 * Vercel will return 413 before that, which is the right behavior anyway.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    console.error("[upload] admin guard rejected:", (e as Error).message);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (e) {
    console.error("[upload] formData parse failed:", e);
    return NextResponse.json({ error: "invalid-form" }, { status: 400 });
  }

  const file = form.get("file");
  const prefix = String(form.get("prefix") ?? "uploads");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing-file" }, { status: 400 });
  }
  if (!isAllowedContentType(file.type)) {
    return NextResponse.json(
      { error: `unsupported-content-type: ${file.type}` },
      { status: 400 },
    );
  }
  if (file.size > BLOB_LIMITS.maximumSizeInBytes) {
    return NextResponse.json({ error: "file-too-large" }, { status: 400 });
  }

  const safePrefix = ["products", "blog", "categories", "uploads"].includes(prefix)
    ? prefix
    : "uploads";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);

  try {
    const blob = await put(`${safePrefix}/${safeName}`, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: true,
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (e) {
    console.error("[upload] put threw:", e);
    return NextResponse.json(
      { error: (e as Error).message ?? "upload-failed" },
      { status: 500 },
    );
  }
}
