import json
import boto3
import uuid
import os
    
s3 = boto3.client("s3")

BUCKET_NAME = "secure-cloud-native-media-upload-pipeline"
UPLOAD_PREFIX = "incoming/"
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB

ALLOWED_MIME = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "mp4": "video/mp4",
    "webm": "video/webm",
    "mov": "video/quicktime"
}

VALID_API_KEY = os.environ.get("API_KEY")

def lambda_handler(event, context):
    # API key check
    if VALID_API_KEY:
        headers = event.get("headers") or {}
        if headers.get("x-api-key") != VALID_API_KEY:
            return response(403, "Forbidden")
        
    body = json.loads(event.get("body") or "{}")

    filename = body.get("filename")
    filesize = body.get("filesize")

    if not filename or not filesize:
        return response(400, "filename and filesize are required")

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
        Fields={
            "Content-Type": content_type
        },
        Conditions=[
            ["content-length-range", 1, MAX_SIZE_BYTES],
            {"Content-Type": content_type},
            ["starts-with", "$key", UPLOAD_PREFIX]
        ],
        ExpiresIn=300
    )

    return response(200, {
        "media_id": media_id,
        "upload": presigned_post
    })

def response(status, message):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(message)
    }