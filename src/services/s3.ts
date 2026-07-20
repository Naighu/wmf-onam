// s3.ts
import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Readable } from "node:stream";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "sydney"
});

export async function listObjectsInS3(bucket: string, prefix = "") {
  const out = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix,Delimiter: "/" }));
  return out
}

export async function getObjectStream(bucket: string, key: string) {
  const { Body, ContentType, ContentLength } =
    await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  return { stream: Body as Readable, contentType: ContentType, size: ContentLength };
}

export async function putObject(bucket: string, key: string, body: Buffer | Readable, contentType?: string) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function removeObject(bucket: string, key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

type Entry = { url: string; exp: number };
const cache = new Map<string, Entry>(); // key -> {url, exp}

const setCache = (k: string, url: string, ttl: number) =>
  cache.set(k, { url, exp: Date.now() + ttl * 1000 - 2000 });
const getCache = (k: string) => {
  const e = cache.get(k);
  return e && e.exp > Date.now() ? e.url : null;
};

export async function presignGet(bucket: string, key: string, seconds = 300) {
  const ck = `GET:${bucket}:${key}:${seconds}`;
  const hit = getCache(ck); if (hit) return hit;
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
  
  setCache(ck, url, seconds);

  return url;
}


export async function streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  
    return Buffer.concat(chunks).toString("utf-8");
  }

