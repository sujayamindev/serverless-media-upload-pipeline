import json
import os
import uuid
from datetime import datetime, timezone

import boto3

s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

BUCKET_NAME = os.environ.get("BUCKET_NAME", "secure-cloud-native-media-upload-pipeline")
TABLE_NAME = os.environ.get("TABLE_NAME", "MediaUploads")
UPLOAD_PREFIX = "incoming/"
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

ALLOWED_MIME = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mov": "video/quicktime",
}

table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    try:
        user_sub = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    except (KeyError, TypeError):
        return response(401, "Unauthorized")

    if not user_sub:
        return response(401, "Unauthorized")

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return response(400, "Invalid JSON body")

    filename = body.get("filename")
    filesize = body.get("filesize")

    if not filename or filesize is None:
        return response(400, "filename and filesize are required")

    # bool is a subclass of int in Python; reject it explicitly so that
    # `{"filesize": true}` does not slip through the isinstance(int) check.
    if isinstance(filesize, bool) or not isinstance(filesize, int):
        return response(400, "filesize must be a non-negative integer")

    if filesize > MAX_SIZE_BYTES:
        return response(400, "File too large")

    ext = filename.split(".")[-1].lower()
    if ext not in ALLOWED_MIME:
        return response(400, "Invalid file type")

    content_type = ALLOWED_MIME[ext]
    media_id = f"{uuid.uuid4()}.{ext}"
    key = UPLOAD_PREFIX + media_id

    presigned_post = s3.generate_presigned_post(
        Bucket=BUCKET_NAME,
        Key=key,
        Fields={"Content-Type": content_type},
        Conditions=[
            ["content-length-range", 1, MAX_SIZE_BYTES],
            {"Content-Type": content_type},
            ["starts-with", "$key", UPLOAD_PREFIX],
        ],
        ExpiresIn=300,
    )

    table.put_item(Item={
        "media_id": media_id,
        "user_sub": user_sub,
        "status": "pending",
        "original_key": key,
        "content_type": content_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return response(200, {
        "media_id": media_id,
        "upload": presigned_post,
    })


def response(status, message):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(message),
    }
