import json
import os
import boto3
from botocore.client import Config

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3', config=Config(signature_version='s3v4'))

TABLE_NAME = os.environ.get('TABLE_NAME', 'MediaUploads')
BUCKET_NAME = os.environ.get('BUCKET_NAME', 'secure-cloud-native-media-upload-pipeline')
PRESIGNED_EXPIRATION = 300  # 5 minutes

table = dynamodb.Table(TABLE_NAME)


def lambda_handler(event, context):
    try:
        user_sub = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
    except (KeyError, TypeError):
        return response(401, "Unauthorized")

    if not user_sub:
        return response(401, "Unauthorized")

    try:
        body = json.loads(event.get('body') or '{}')
    except json.JSONDecodeError:
        return response(400, 'Invalid JSON body')
    media_id = body.get('media_id')

    if not media_id:
        return response(400, 'media_id is required')

    # Fetch metadata from DynamoDB
    try:
        result = table.get_item(Key={'media_id': media_id})
        item = result.get('Item')
        if not item:
            return response(404, 'Media not found')
    except Exception as e:
        print(f'Error: {str(e)}')
        return response(500, 'Internal error')

    # Ownership check — fail secure for legacy records missing user_sub
    if item.get('user_sub') != user_sub:
        return response(403, 'Forbidden')

    # Generate presigned URL for approved items
    preview_url = None
    if item.get('status') == 'approved':
        try:
            preview_url = s3.generate_presigned_url(
                'get_object',
                Params={'Bucket': BUCKET_NAME, 'Key': item['final_key']},
                ExpiresIn=PRESIGNED_EXPIRATION
            )
        except Exception as e:
            print(f'Error: {str(e)}')
            return response(500, 'Internal error')

    # Build response
    data = {
        'media_id': item['media_id'],
        'status': item['status'],
        'rejection_reason': item.get('rejection_reason'),
        'content_type': item.get('content_type'),
        'file_size': item.get('file_size'),
        'original_key': item.get('original_key'),
        'final_key': item.get('final_key'),
        'created_at': item.get('created_at'),
        'checked_at': item.get('checked_at'),
        'preview_url': preview_url
    }

    return response(200, data)


def response(status, message):
    return {
        'statusCode': status,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps(message)
    }
