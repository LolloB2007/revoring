import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";
import { nanoid } from "nanoid";

/**
 * Cloudflare R2 client (S3-compatible). Used for product images, blog covers,
 * and user-uploaded admin media. Uploads go via signed URLs direct from the
 * browser so files never transit our Node runtime.
 */
function getClient(): S3Client | null {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function createPresignedUpload(input: {
  contentType: string;
  byteSize: number;
  prefix: "products" | "blog" | "categories" | "uploads";
}): Promise<{ url: string; key: string; publicUrl: string } | { error: string }> {
  if (!ALLOWED_MIME.has(input.contentType)) return { error: "unsupported-mime" };
  if (input.byteSize <= 0 || input.byteSize > MAX_BYTES) return { error: "invalid-size" };
  const client = getClient();
  if (!client) return { error: "r2-not-configured" };
  const ext = input.contentType.split("/")[1] ?? "bin";
  const key = `${input.prefix}/${nanoid(16)}.${ext}`;
  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: input.contentType,
    ContentLength: input.byteSize,
  });
  const url = await getSignedUrl(client, cmd, { expiresIn: 60 });
  const publicHost = env.R2_PUBLIC_HOST ?? "";
  const publicUrl = publicHost ? `https://${publicHost}/${key}` : key;
  return { url, key, publicUrl };
}

export async function deleteObject(key: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false;
  await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }));
  return true;
}
