import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { createPresignedUpload } from "@/lib/r2";

const Body = z.object({
  contentType: z.string().max(80),
  byteSize: z.coerce.number().int().positive().max(10 * 1024 * 1024),
  prefix: z.enum(["products", "blog", "categories", "uploads"]).default("uploads"),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await createPresignedUpload(parsed.data);
  if ("error" in result) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
