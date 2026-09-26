// Dev-only stand-in for API Gateway + Lambda + S3, so the full upload flow (including the
// approved preview) can be tried locally without AWS. Enabled by `npm run dev:mock`
// (vite --mode mock, which loads .env.mock); never part of a production build.
//
// It mirrors the real contracts:
//   POST /__mock/api/generate-upload-url -> { media_id, upload: { url, fields } }  (generateUploadUrl)
//   POST /__mock/s3                        -> 204, multipart form like an S3 presigned POST
//   POST /__mock/api/media-status          -> pending for a few seconds, then approved or
//                                             rejected by magic bytes (imageValidator), with
//                                             a preview_url for approved files (getMediaStatus)
//   GET  /__mock/s3/approved/<media_id>    -> the uploaded bytes, for the preview
// Everything lives in memory and is lost when the dev server restarts.

import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';

const API = '/__mock/api';
const S3 = '/__mock/s3';
const MAX_SIZE_BYTES = 50 * 1024 * 1024;
const CHECK_DELAY_MS = 4000; // how long a row stays `pending` after the upload finishes
const UPLOAD_BYTES_PER_SEC = 4 * 1024 * 1024; // throttled so the progress bar is visible

// Same table as ALLOWED_MIME in lambda/generateUploadUrl.
const ALLOWED_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
};
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const records = new Map(); // media_id -> DynamoDB-like row plus the uploaded bytes

// Magic-byte sniffing, like `filetype` in imageValidator (without Pillow/OpenCV decoding).
function detectMime(buf) {
  const ascii = (start, end) => buf.subarray(start, end).toString('latin1');
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  if (buf.length >= 4 && buf.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]))) return 'video/webm';
  if (buf.length >= 12 && ascii(4, 8) === 'ftyp') return ascii(8, 12) === 'qt  ' ? 'video/quicktime' : 'video/mp4';
  return null;
}

// Same outcomes and messages as validate_image_content / validate_video_content.
function validate(buf, mediaId) {
  const isVideo = VIDEO_TYPES.includes(ALLOWED_MIME[mediaId.split('.').pop()]);
  const detected = detectMime(buf);
  if (!detected) return { ok: false, reason: 'Unable to determine file type from content' };
  const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
  if (!allowed.includes(detected)) {
    return { ok: false, reason: `File content is ${detected}, not an allowed ${isVideo ? 'video' : 'image'} type` };
  }
  return { ok: true };
}

function send(res, status, body, headers = {}) {
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (body === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req, throttle = false) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (throttle) {
      req.pause();
      await new Promise((r) => setTimeout(r, (chunk.length / UPLOAD_BYTES_PER_SEC) * 1000));
      req.resume();
    }
  }
  return Buffer.concat(chunks);
}

// Minimal multipart/form-data parser: returns { fields, file }.
function parseMultipart(body, contentType) {
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType ?? '');
  if (!boundary) return null;
  const delimiter = Buffer.from(`--${boundary[1] ?? boundary[2]}`);
  const fields = {};
  let file = null;
  let start = body.indexOf(delimiter);
  while (start !== -1) {
    const next = body.indexOf(delimiter, start + delimiter.length);
    if (next === -1) break;
    const part = body.subarray(start + delimiter.length + 2, next - 2); // skip CRLFs
    const split = part.indexOf('\r\n\r\n');
    const headers = part.subarray(0, split).toString();
    const content = part.subarray(split + 4);
    const name = /name="([^"]+)"/.exec(headers)?.[1];
    if (name === 'file') file = content;
    else if (name) fields[name] = content.toString();
    start = next;
  }
  return { fields, file };
}

function bearer(req) {
  return /^Bearer \S+/.test(req.headers.authorization ?? '');
}

async function generateUploadUrl(req, res) {
  if (!bearer(req)) return send(res, 401, 'Unauthorized');
  let body;
  try {
    body = JSON.parse((await readBody(req)).toString() || '{}');
  } catch {
    return send(res, 400, 'Invalid JSON body');
  }
  const { filename, filesize } = body;
  if (!filename || filesize == null) return send(res, 400, 'filename and filesize are required');
  if (!Number.isInteger(filesize)) return send(res, 400, 'filesize must be a non-negative integer');
  if (filesize > MAX_SIZE_BYTES) return send(res, 400, 'File too large');
  const ext = filename.split('.').pop().toLowerCase();
  if (!ALLOWED_MIME[ext]) return send(res, 400, 'Invalid file type');

  const mediaId = `${randomUUID()}.${ext}`;
  const now = new Date();
  records.set(mediaId, {
    media_id: mediaId,
    status: 'pending',
    original_key: `incoming/${mediaId}`,
    content_type: ALLOWED_MIME[ext],
    created_at: now.toISOString(),
  });

  const date = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  send(res, 200, {
    media_id: mediaId,
    upload: {
      url: S3,
      fields: {
        'Content-Type': ALLOWED_MIME[ext],
        key: `incoming/${mediaId}`,
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': `MOCKACCESSKEY/${date.slice(0, 8)}/us-east-1/s3/aws4_request`,
        'x-amz-date': date,
        policy: 'mock-policy',
        'x-amz-signature': 'mock-signature',
      },
    },
  });
}

async function s3Upload(req, res) {
  const form = parseMultipart(await readBody(req, true), req.headers['content-type']);
  const mediaId = form?.fields.key?.replace(/^incoming\//, '');
  const row = records.get(mediaId);
  if (!row || !form.file?.length) return send(res, 403, undefined);
  if (form.file.length > MAX_SIZE_BYTES) return send(res, 400, undefined);
  row.bytes = form.file;
  row.checkAt = Date.now() + CHECK_DELAY_MS;
  send(res, 204, undefined);
}

async function mediaStatus(req, res) {
  if (!bearer(req)) return send(res, 401, 'Unauthorized');
  let mediaId;
  try {
    mediaId = JSON.parse((await readBody(req)).toString() || '{}').media_id;
  } catch {
    return send(res, 400, 'Invalid JSON body');
  }
  const row = records.get(mediaId);
  if (!row) return send(res, 404, 'Not found');

  // The "validator" runs once the delay has passed, then overwrites the row.
  if (row.status === 'pending' && row.checkAt && Date.now() >= row.checkAt) {
    const result = validate(row.bytes, mediaId);
    row.status = result.ok ? 'approved' : 'rejected';
    row.final_key = `${row.status}/${mediaId}`;
    row.file_size = String(row.bytes.length);
    row.checked_at = new Date().toISOString();
    if (!result.ok) row.rejection_reason = result.reason;
  }

  send(res, 200, {
    media_id: row.media_id,
    status: row.status,
    rejection_reason: row.rejection_reason ?? null,
    content_type: row.content_type,
    file_size: row.file_size ?? null,
    original_key: row.original_key,
    final_key: row.final_key ?? null,
    created_at: row.created_at,
    checked_at: row.checked_at ?? null,
    preview_url: row.status === 'approved' ? `${S3}/${row.final_key}?X-Amz-Expires=3600&X-Amz-Signature=mock` : null,
  });
}

// Serves approved bytes, with Range support so <video> can seek.
function s3Get(req, res, key) {
  const row = records.get(key.replace(/^approved\//, ''));
  if (!row || row.status !== 'approved') return send(res, 404, undefined);
  const size = row.bytes.length;
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  let start = 0;
  let end = size - 1;
  if (range) {
    start = range[1] ? Number(range[1]) : size - Number(range[2]);
    end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
  }
  res.setHeader('Content-Type', row.content_type);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Length', end - start + 1);
  res.end(row.bytes.subarray(start, end + 1));
}

export default function mockBackend() {
  return {
    name: 'mock-backend',
    apply: 'serve',
    configureServer(server) {
      server.config.logger.info('\n  Mock backend on: API Gateway, Lambda and S3 are simulated in memory.\n');
      server.middlewares.use(async (req, res, next) => {
        const path = req.url.split('?')[0];
        try {
          if (req.method === 'POST' && path === `${API}/generate-upload-url`) return await generateUploadUrl(req, res);
          if (req.method === 'POST' && path === `${API}/media-status`) return await mediaStatus(req, res);
          if (req.method === 'POST' && path === S3) return await s3Upload(req, res);
          if (req.method === 'GET' && path.startsWith(`${S3}/`)) return s3Get(req, res, path.slice(S3.length + 1));
        } catch (err) {
          server.config.logger.error(`mock backend: ${err.stack ?? err}`);
          return send(res, 500, 'Internal error');
        }
        next();
      });
    },
  };
}
