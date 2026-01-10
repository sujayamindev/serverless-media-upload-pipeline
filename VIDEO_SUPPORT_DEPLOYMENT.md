# Video Support Deployment Guide

## Overview
The smart-media-upload-pipeline has been successfully updated to support video files (MP4, WebM, MOV) in addition to images. The file size limit has been increased from 5MB to 50MB.

## Changes Summary

### Backend Changes

#### 1. generateUploadUrl Lambda Function
- ✅ Added video MIME types: `video/mp4`, `video/webm`, `video/quicktime`
- ✅ Added video extensions: `.mp4`, `.webm`, `.mov`
- ✅ Increased `MAX_SIZE_BYTES` from 5MB to 50MB

#### 2. imageValidator Lambda Function
- ✅ Added video MIME types and extensions to allowed lists
- ✅ Increased `MAX_SIZE_BYTES` from 5MB to 50MB
- ✅ Created new `validate_video_content()` function using OpenCV
- ✅ Updated `lambda_handler` to route to appropriate validator (image vs video)
- ✅ Updated function documentation to reflect media (not just images)

### Frontend Changes

#### 3. UploadPage.jsx
- ✅ Updated file input accept attribute: `image/*,video/*`
- ✅ Updated file requirements text to show video formats and 50MB limit
- ✅ Added conditional rendering for `<video>` or `<img>` tags based on file type

#### 4. HowItWorksPage.jsx
- ✅ Updated documentation to mention video validation and 50MB limit

## Deployment Requirements

### ⚠️ CRITICAL: Lambda Layer Required

The imageValidator Lambda function now requires **opencv-python-headless** to validate video files. You MUST add a Lambda Layer before deploying.

#### Option 1: Create Lambda Layer (Recommended)

1. **Build the layer locally:**
   ```bash
   mkdir python
   pip install opencv-python-headless -t python/
   zip -r opencv-layer.zip python/
   ```

2. **Upload to AWS Lambda:**
   - Go to AWS Lambda Console → Layers → Create Layer
   - Name: `opencv-python-layer`
   - Upload `opencv-layer.zip`
   - Compatible runtimes: Python 3.9, 3.10, 3.11, 3.12

3. **Attach to imageValidator function:**
   - Go to imageValidator function → Configuration → Layers
   - Add Layer → Custom layers → opencv-python-layer

#### Option 2: Use Public Lambda Layer

Search for public opencv-python layers in your AWS region (e.g., `AWSLambda-Python39-OpenCV` or similar community layers).

### Lambda Configuration Updates

Update the imageValidator Lambda function settings:

1. **Timeout**: Increase from 3s to **30-60 seconds**
   - Video validation takes longer than image validation
   - Path: Configuration → General configuration → Timeout

2. **Memory**: Increase to **512MB or 1024MB** (optional but recommended)
   - Video processing benefits from more memory
   - More memory also increases CPU allocation
   - Path: Configuration → General configuration → Memory

### S3 Trigger Configuration

No changes needed to the S3 trigger - it will continue to work as-is.

### DynamoDB Table

No schema changes required. The existing `MediaUploads` table will automatically store video metadata.

### API Gateway

No changes required - the APIs are already generic enough to handle any media type.

## Testing Checklist

### Backend Testing

1. **Test generateUploadUrl with video file:**
   ```json
   POST /upload-url
   {
     "filename": "test.mp4",
     "filesize": 5242880
   }
   ```

2. **Upload a test video to S3** using the presigned URL

3. **Monitor imageValidator CloudWatch logs** for:
   - Video MIME type detection
   - OpenCV validation success
   - Frame count, FPS, resolution logs

4. **Check DynamoDB** for the media record with status `approved`

5. **Test getMediaStatus** and verify preview_url is generated

### Frontend Testing

1. **File selection**: Select both image and video files
2. **Upload process**: Verify progress bar works for large files
3. **Status checking**: Confirm status updates show correctly
4. **Preview display**:
   - Images should display in `<img>` tag
   - Videos should display in `<video>` tag with controls

### Edge Cases to Test

- [ ] Video file renamed to .jpg (should be detected and rejected)
- [ ] Corrupted video file (should be rejected)
- [ ] Video exactly at 50MB limit
- [ ] Video over 50MB limit (should be rejected by presigned URL)
- [ ] Unsupported video format (e.g., .avi) (should be rejected)
- [ ] Very short video (<1 second)
- [ ] Mix of image and video uploads in succession

## Rollback Plan

If issues arise, revert to previous version:

1. **Backend**: Deploy previous Lambda function code (image-only validation)
2. **Frontend**: Revert to previous commit or change accept to `image/*` only
3. **Remove Lambda Layer**: Detach opencv-python-layer from imageValidator

## Performance Considerations

### File Size Impact
- 50MB videos will take 5-10 seconds to upload on typical broadband
- S3 upload progress should be visible to users
- Validation may take 2-5 seconds for large videos

### Lambda Cold Start
- First video validation after idle period may take 3-5 seconds
- OpenCV layer adds ~2-3 seconds to cold start time
- Consider provisioned concurrency if this is critical

### Cost Implications
- **S3**: 50MB files = 10x storage compared to 5MB
- **Lambda**: Longer execution time = higher compute costs
- **Data Transfer**: More bandwidth for uploads/downloads

Estimated cost increase: ~2-3x for typical usage patterns

## Support Video Formats

| Format | Extension | MIME Type | Browser Support |
|--------|-----------|-----------|-----------------|
| MP4    | .mp4      | video/mp4 | Excellent (all modern browsers) |
| WebM   | .webm     | video/webm | Good (Chrome, Firefox, Edge) |
| MOV    | .mov      | video/quicktime | Limited (Safari best, others via plugins) |

### Recommendations:
- **MP4** is the safest choice for maximum compatibility
- **WebM** is great for web-native applications
- **MOV** works but may have playback issues in some browsers

## Troubleshooting

### Issue: "Missing required library: ModuleNotFoundError: No module named 'cv2'"
**Solution**: Lambda Layer with opencv-python-headless not attached. Follow deployment steps above.

### Issue: Videos are rejected with "Unable to open video file"
**Possible causes**:
- Corrupted video file
- Unsupported codec within the container (e.g., AV1 codec in MP4)
- OpenCV version incompatibility

**Solution**: Check CloudWatch logs for detailed error messages. May need to update OpenCV version in Lambda Layer.

### Issue: Lambda timeout during video validation
**Solution**: Increase timeout to 60 seconds or more for very large videos.

### Issue: Video preview not working in frontend
**Possible causes**:
- Browser doesn't support video codec
- CORS issue with presigned URL
- Video MIME type not set correctly

**Solution**: Check browser console for errors. Verify `detected_type` field in DynamoDB has correct MIME type.

## Next Steps (Optional Enhancements)

Consider these future improvements:

1. **Video Transcoding**: Use AWS MediaConvert to standardize all videos to H.264 MP4
2. **Thumbnail Generation**: Extract first frame as preview image
3. **Duration Limits**: Reject videos longer than X minutes
4. **Resolution Validation**: Enforce minimum/maximum resolution
5. **Bitrate Analysis**: Ensure quality meets standards
6. **WebAssembly Validation**: Client-side validation before upload to save bandwidth

## Contact & Support

For issues or questions about this deployment, refer to:
- CloudWatch Logs for Lambda functions
- S3 event notifications
- DynamoDB table for validation results
