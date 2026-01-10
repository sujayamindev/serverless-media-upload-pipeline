import json
import boto3
import uuid

s3 = boto3.client("s3")

BUCKET_NAME = "smart-media-upload-pipeline-v1"
UPLOAD_PREFIX = "incoming/"
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB

ALLOWED_MIME = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp"
}

def lambda_handler(event, context):
    body = json.loads(event.get("body", "{}"))

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
