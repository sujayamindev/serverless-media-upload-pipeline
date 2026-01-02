import json
import boto3
import uuid
import os

s3 = boto3.client('s3')

BUCKET_NAME = 'smart-media-upload-pipeline-v1'
UPLOAD_PREFIX = 'incoming/'
ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
MAX_SIZE_MB = 5

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    filename = body.get('filename')
    filesize = body.get('filesize')
    ext = filename.split('.')[-1].lower()

    if not filename:
        return response(400, 'Filename is required')

    if not filesize or filesize > MAX_SIZE_MB * 1024 * 1024:
        return response(400, 'File too large')
  
    if ext not in ALLOWED_EXTENSIONS:
        return response(400, 'Invalid file type')

    if ext  == 'jpg':
        ext = 'jpeg'  # Normalize jpg to jpeg

    media_id = f"{uuid.uuid4()}.{ext}"
    key = UPLOAD_PREFIX + media_id

    upload_url = s3.generate_presigned_url(
        'put_object',
        Params={
            'Bucket': BUCKET_NAME,
            'Key': key,
            'ContentType': f'image/{ext}'
        },
        ExpiresIn=300  # 5 minutes
    )

    return response(200, {
        'media_id': media_id,
        'upload_url': upload_url,
        'method' : 'PUT',
        'headers' : {
            'Content-Type': f'image/{ext}'
        },
        'expires_in': 300,
        's3_key': key
    })

def response(status, message):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps(message)
    }
