import boto3
import os
from datetime import datetime
import logging
import io

try:
    import filetype
    from PIL import Image
except ImportError as e:
    logging.error(f"Missing required library: {e}")
    raise

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('MediaUploads')

APPROVED_FOLDER = 'approved/'
REJECTED_FOLDER = 'rejected/'

ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5MB max


def validate_file_content(file_content, filename):
    """
    Validate file using content-based detection and image integrity verification.
    
    Returns:
        tuple: (is_valid: bool, reason: str, detected_type: str)
    """
    try:
        # Step 1: Detect true file type using magic numbers
        kind = filetype.guess(file_content)
        
        if kind is None:
            return False, "Unable to determine file type from content", "unknown"
        
        detected_mime = kind.mime
        logger.info(f"Detected MIME type for {filename}: {detected_mime}")
        
        # Step 2: Verify detected type is an allowed image format
        if detected_mime not in ALLOWED_TYPES:
            return False, f"File content is {detected_mime}, not an allowed image type", detected_mime
        
        # Step 3: Verify image integrity using Pillow
        try:
            img = Image.open(io.BytesIO(file_content))
            img.verify()  # Checks for file integrity
            
            # Re-open for format check (verify() closes the file)
            img = Image.open(io.BytesIO(file_content))
            img_format = img.format.lower() if img.format else 'unknown'
            
            logger.info(f"Image format verified for {filename}: {img_format}")
                        
            return True, "Valid image file", detected_mime
            
        except Exception as e:
            logger.warning(f"Image integrity check failed for {filename}: {str(e)}")
            return False, f"Corrupted or invalid image: {str(e)}", detected_mime
            
    except Exception as e:
        logger.error(f"Content validation error for {filename}: {str(e)}", exc_info=True)
        return False, f"Validation error: {str(e)}", "error"


def lambda_handler(event, context):
    """
    S3-triggered Lambda function to validate uploaded images.
    Performs content-based validation to prevent fake file extensions.
    """
    logger.info(f"Processing {len(event['Records'])} record(s)")
    
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        filename = key.split('/')[-1]
        
        logger.info(f"Processing file: {key}")
        
        try:
            # Get object metadata
            obj_metadata = s3.head_object(Bucket=bucket, Key=key)
            size = obj_metadata['ContentLength']
            content_type = obj_metadata['ContentType']
            ext = os.path.splitext(key.lower())[1]
            
            # Initialize validation variables
            status = 'rejected'
            rejection_reason = None
            detected_type = content_type
            
            # Step 1: Basic metadata validation
            if size > MAX_SIZE_BYTES:
                rejection_reason = f"File too large: {size} bytes (max {MAX_SIZE_BYTES})"
                logger.info(f"Rejected {filename}: {rejection_reason}")
            
            elif ext not in ALLOWED_EXTENSIONS:
                rejection_reason = f"Invalid file extension: {ext}"
                logger.info(f"Rejected {filename}: {rejection_reason}")
            
            else:
                # Step 2: Download file for content-based validation
                logger.info(f"Downloading {filename} for content validation")
                obj = s3.get_object(Bucket=bucket, Key=key)
                file_content = obj['Body'].read()
                
                # Step 3: Validate actual file content
                is_valid, reason, detected_type = validate_file_content(file_content, filename)
                
                if is_valid:
                    status = 'approved'
                    logger.info(f"Approved {filename}: {reason}")
                else:
                    rejection_reason = reason
                    logger.info(f"Rejected {filename}: {reason}")
            
            # Determine destination folder
            destination = (APPROVED_FOLDER if status == 'approved' else REJECTED_FOLDER) + filename
            
            # Move object to appropriate folder
            s3.copy_object(
                Bucket=bucket,
                CopySource={'Bucket': bucket, 'Key': key},
                Key=destination
            )
            s3.delete_object(Bucket=bucket, Key=key)
            
            logger.info(f"Moved {filename} to {destination}")
            
            # Write metadata to DynamoDB
            dynamo_item = {
                'media_id': filename,
                'status': status,
                'original_key': key,
                'final_key': destination,
                'content_type': content_type,
                'detected_type': detected_type,
                'file_size': str(size),
                'created_at': record['eventTime'],
                'checked_at': datetime.now().isoformat(),
            }
            
            # Add rejection reason if applicable
            if rejection_reason:
                dynamo_item['rejection_reason'] = rejection_reason
            
            table.put_item(Item=dynamo_item)
            logger.info(f"Updated DynamoDB for {filename}")
            
        except Exception as e:
            logger.error(f"Error processing {key}: {str(e)}", exc_info=True)
            
            # Attempt to move to rejected folder and log error
            try:
                error_destination = REJECTED_FOLDER + filename
                s3.copy_object(
                    Bucket=bucket,
                    CopySource={'Bucket': bucket, 'Key': key},
                    Key=error_destination
                )
                s3.delete_object(Bucket=bucket, Key=key)
                
                table.put_item(Item={
                    'media_id': filename,
                    'status': 'rejected',
                    'original_key': key,
                    'final_key': error_destination,
                    'rejection_reason': f"Processing error: {str(e)}",
                    'file_size': str(size),
                    'created_at': record.get('eventTime', datetime.now().isoformat()),
                    'checked_at': datetime.now().isoformat(),  
                })
            except Exception as cleanup_error:
                logger.error(f"Failed to handle error for {key}: {str(cleanup_error)}")
    
    return {'statusCode': 200, 'body': 'Processing complete'}
