import boto3
import os
from datetime import datetime
import mimetypes

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MediaUploads')

APPROVED_FOLDER = 'approved/'
REJECTED_FOLDER = 'rejected/'

ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB max


def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']

        # Get object metadata
        obj = s3.head_object(Bucket=bucket, Key=key)
        size = obj['ContentLength']
        content_type = obj['ContentType']
        ext = os.path.splitext(key.lower())[1]

        # Validate
        if content_type not in ALLOWED_TYPES or size > MAX_SIZE_BYTES or ext not in ALLOWED_EXTENSIONS:
            destination = REJECTED_FOLDER + key.split('/')[-1]
            status = 'rejected'
        else:
            destination = APPROVED_FOLDER + key.split('/')[-1]
            status = 'approved'

        # Move object
        s3.copy_object(Bucket=bucket, CopySource={'Bucket': bucket, 'Key': key}, Key=destination)
        s3.delete_object(Bucket=bucket, Key=key)

        # Write metadata to DynamoDB
        table.put_item(Item={
            'media_id': key.split('/')[-1],
            'status': status,
            'original_key': key,
            'final_key': destination,
            'content_type': content_type,
            'created_at' : record['eventTime'],
            'checked_at': datetime.now().isoformat(),
        })

    return {'status': 'done'}
