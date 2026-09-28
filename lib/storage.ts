import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { env } from "./env";
import { apiMessages, getRequestLocale } from "./api-errors";

const MAX_INPUT_BYTES = 15 * 1024 * 1024; // pre-optimize allowance
const TARGET_WIDTH = 1600;
const THUMB_WIDTH = 400;

export type UploadResult = { url: string; thumbUrl: string };

export async function uploadImage(file: File): Promise<UploadResult> {
  const t = apiMessages(getRequestLocale());
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(t.imageTooLarge);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(buf).metadata();
  if (!meta.format || !["jpeg", "png", "webp", "gif"].includes(meta.format)) {
    throw new Error(t.unsupportedImageType);
  }

  const id = randomUUID();
  const mainKey = `${id}.webp`;
  const thumbKey = `${id}-thumb.webp`;

  const main = await sharp(buf)
    .rotate()
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const thumb = await sharp(buf)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer();

  if (env.STORAGE_DRIVER === "s3") {
    return uploadS3(mainKey, main, thumbKey, thumb);
  }
  return uploadLocal(mainKey, main, thumbKey, thumb);
}

async function uploadLocal(
  mainKey: string,
  main: Buffer,
  thumbKey: string,
  thumb: Buffer
): Promise<UploadResult> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, mainKey), main);
  await writeFile(path.join(dir, thumbKey), thumb);
  return { url: `/uploads/${mainKey}`, thumbUrl: `/uploads/${thumbKey}` };
}

async function uploadS3(
  mainKey: string,
  main: Buffer,
  thumbKey: string,
  thumb: Buffer
): Promise<UploadResult> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  if (!env.S3_BUCKET || !env.S3_REGION) throw new Error("S3 not configured");

  const client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    credentials:
      env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
    forcePathStyle: !!env.S3_ENDPOINT,
  });

  await Promise.all([
    client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: mainKey,
        Body: main,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    ),
    client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: thumbKey,
        Body: thumb,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    ),
  ]);

  const base = env.S3_PUBLIC_URL ?? `https://${env.S3_BUCKET}.s3.${env.S3_REGION}.amazonaws.com`;
  return {
    url: `${base}/${mainKey}`,
    thumbUrl: `${base}/${thumbKey}`,
  };
}
