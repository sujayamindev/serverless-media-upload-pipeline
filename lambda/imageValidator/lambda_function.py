import boto3
import os
import warnings
from datetime import datetime, timezone
import logging
import io
from urllib import parse

try:
    import filetype
    from PIL import Image
    import cv2
except ImportError as e:
    logging.error(f"Missing required library: {e}")
    raise

# Cap decoded pixel count and turn decompression-bomb warnings into hard errors
# so a malicious image with declared gigapixel dimensions can be rejected before
# Pillow allocates memory for it.
Image.MAX_IMAGE_PIXELS = 50_000_000
warnings.simplefilter("error", Image.DecompressionBombWarning)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])
tags = {'keep': 'false'}

tag_string = parse.urlencode(tags)

APPROVED_FOLDER = 'approved/'
REJECTED_FOLDER = 'rejected/'

ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
VIDEO_EXTENSIONS = {'.mp4', '.webm', '.mov'}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | VIDEO_EXTENSIONS
MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50MB max


def validate_image_content(file_content, filename):
    """
    Validate image file using content-based detection and image integrity verification.
    
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
        if detected_mime not in ['image/jpeg', 'image/png', 'image/webp']:
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


def validate_video_content(file_content, filename):
    """
    Validate video file using content-based detection and video integrity verification.
    Uses opencv-python to verify the video can be opened and read.
    
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
        
        # Step 2: Verify detected type is an allowed video format
        if detected_mime not in ['video/mp4', 'video/webm', 'video/quicktime']:
            return False, f"File content is {detected_mime}, not an allowed video type", detected_mime
        
        # Step 3: Verify video integrity using OpenCV
        try:
            # Write to temporary file for OpenCV to read
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp_file:
                tmp_file.write(file_content)
                tmp_path = tmp_file.name
            
            try:
                # Try to open video with OpenCV
                cap = cv2.VideoCapture(tmp_path)
                
                if not cap.isOpened():
                    cap.release()
                    return False, "Unable to open video file", detected_mime
                
                # Try to read at least one frame
                ret, frame = cap.read()
                if not ret or frame is None:
                    cap.release()
                    return False, "Video contains no readable frames", detected_mime
                
                # Get video properties
                frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                
                cap.release()
                
                logger.info(f"Video verified for {filename}: {width}x{height}, {frame_count} frames, {fps} fps")
                
                return True, "Valid video file", detected_mime
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                    
        except Exception as e:
            logger.warning(f"Video integrity check failed for {filename}: {str(e)}")
            return False, f"Corrupted or invalid video: {str(e)}", detected_mime
            
    except Exception as e:
        logger.error(f"Content validation error for {filename}: {str(e)}", exc_info=True)
        return False, f"Validation error: {str(e)}", "error"


def lambda_handler(event, context):
    """
    S3-triggered Lambda function to validate uploaded media files (images and videos).
    Performs content-based validation to prevent fake file extensions.
    """
    logger.info(f"Processing {len(event['Records'])} record(s)")
    
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        filename = key.split('/')[-1]
        
        logger.info(f"Processing file: {key}")
        
        size = None
        # Initialize early so the error/salvage path can always reference them.
        content_type = "unknown"
        detected_type = "unknown"
        try:
            # Get object metadata
            obj_metadata = s3.head_object(Bucket=bucket, Key=key)
            size = obj_metadata['ContentLength']
            content_type = obj_metadata['ContentType']
            detected_type = content_type
            ext = os.path.splitext(key.lower())[1]

            # Initialize validation variables
            status = 'rejected'
            rejection_reason = None

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

                # Step 3: Route by extension (the validated authority).
                # Each validator performs magic-byte assertion internally, so a
                # mismatched extension/content combo will be rejected with the
                # correct reason rather than silently sent to the wrong path.
                if ext in VIDEO_EXTENSIONS:
                    is_valid, reason, detected_type = validate_video_content(file_content, filename)
                elif ext in IMAGE_EXTENSIONS:
                    is_valid, reason, detected_type = validate_image_content(file_content, filename)
                else:
                    is_valid, reason, detected_type = False, f"Invalid file extension: {ext}", "unknown"

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
                Key=destination,
                TaggingDirective='REPLACE',
                Tagging=tag_string
            )

            # Best-effort delete; if it fails the lifecycle rule on incoming/
            # (1 day) will clean up. Don't re-raise — re-raising would surface
            # to the outer except, which would then re-process the still-stale
            # incoming/ object and duplicate validation work.
            try:
                s3.delete_object(Bucket=bucket, Key=key)
            except Exception as delete_error:
                print(f"Failed to delete {key} after copy; lifecycle will clean up: {delete_error}")

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
                'checked_at': datetime.now(timezone.utc).isoformat(),
            }

            # Add rejection reason if applicable
            if rejection_reason:
                dynamo_item['rejection_reason'] = rejection_reason

            # Preserve user_sub written by generateUploadUrl at upload time
            existing = table.get_item(Key={'media_id': filename}).get('Item') or {}
            if existing.get('user_sub'):
                dynamo_item['user_sub'] = existing['user_sub']

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
                    Key=error_destination,
                    TaggingDirective='REPLACE',
                    Tagging=tag_string
                )
                try:
                    s3.delete_object(Bucket=bucket, Key=key)
                except Exception as delete_error:
                    print(f"Failed to delete {key} after error-path copy; lifecycle will clean up: {delete_error}")

                error_item = {
                    'media_id': filename,
                    'status': 'rejected',
                    'original_key': key,
                    'final_key': error_destination,
                    'rejection_reason': f"Processing error: {str(e)}",
                    'content_type': content_type,
                    'detected_type': detected_type,
                    'file_size': str(size) if size is not None else 'unknown',
                    'created_at': record.get('eventTime', datetime.now(timezone.utc).isoformat()),
                    'checked_at': datetime.now(timezone.utc).isoformat(),
                }
                existing = table.get_item(Key={'media_id': filename}).get('Item') or {}
                if existing.get('user_sub'):
                    error_item['user_sub'] = existing['user_sub']
                table.put_item(Item=error_item)
            except Exception as cleanup_error:
                logger.error(f"Failed to handle error for {key}: {str(cleanup_error)}")
    
    return {'statusCode': 200, 'body': 'Processing complete'}
