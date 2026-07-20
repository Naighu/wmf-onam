"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
exports.listObjectsInS3 = listObjectsInS3;
exports.getObjectStream = getObjectStream;
exports.putObject = putObject;
exports.removeObject = removeObject;
exports.presignGet = presignGet;
exports.streamToString = streamToString;
// s3.ts
const client_s3_1 = require("@aws-sdk/client-s3");
const client_s3_2 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
exports.s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "sydney"
});
async function listObjectsInS3(bucket, prefix = "") {
    const out = await exports.s3.send(new client_s3_1.ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, Delimiter: "/" }));
    return out;
}
async function getObjectStream(bucket, key) {
    const { Body, ContentType, ContentLength } = await exports.s3.send(new client_s3_2.GetObjectCommand({ Bucket: bucket, Key: key }));
    return { stream: Body, contentType: ContentType, size: ContentLength };
}
async function putObject(bucket, key, body, contentType) {
    await exports.s3.send(new client_s3_2.PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}
async function removeObject(bucket, key) {
    await exports.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
const cache = new Map(); // key -> {url, exp}
const setCache = (k, url, ttl) => cache.set(k, { url, exp: Date.now() + ttl * 1000 - 2000 });
const getCache = (k) => {
    const e = cache.get(k);
    return e && e.exp > Date.now() ? e.url : null;
};
async function presignGet(bucket, key, seconds = 300) {
    const ck = `GET:${bucket}:${key}:${seconds}`;
    const hit = getCache(ck);
    if (hit)
        return hit;
    const url = await (0, s3_request_presigner_1.getSignedUrl)(exports.s3, new client_s3_2.GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: seconds });
    setCache(ck, url, seconds);
    return url;
}
async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}
