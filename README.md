# Secure Cloud-Native Media Upload Pipeline (AWS Serverless)

A **secure, serverless media upload pipeline** built on AWS, designed using a **zero-trust client model** with **direct-to-S3 uploads**, strict server-side validation, and short-lived access everywhere.

This project demonstrates **production-grade cloud architecture**, security-first design decisions, and clear separation of responsibilities between frontend, backend, and storage.

---

## Why This Project Exists

Uploading user-generated media sounds simple — until it isn’t.

Common problems in traditional upload systems:

* Backend servers become bottlenecks for large files
* Client-side validation is easy to bypass
* Long-lived credentials increase security risk
* File size and type enforcement is unreliable
* Scaling becomes expensive and complex

This project demonstrates how to solve these problems using **AWS-native patterns** that are scalable, secure, and cost-efficient.

---

## Architecture Overview

![Architecture Diagram](docs/diagram.svg)

### High-level flow

1. The frontend requests a **short-lived upload policy**
2. The browser uploads the file **directly to Amazon S3**
3. Amazon S3 triggers **server-side media validation**
4. Files are automatically **approved or rejected**
5. The frontend securely checks status and previews approved media

The backend is **never involved in file transfer**, eliminating upload bottlenecks and reducing attack surface.

---

## How It Works (Summary)

### 1. Secure Upload Policy

* The frontend requests a **pre-signed POST policy** from the backend
* The policy strictly enforces:

  * File size limits
  * Content type
  * Upload location
  * Expiration time
* These rules are enforced by **Amazon S3**, not the client

### 2. Direct Upload to S3

* The browser uploads the file directly to S3 using the presigned POST policy
* The backend is completely bypassed during transfer
* S3 validates the upload conditions and responds with HTTP `204 No Content` on success

### 3. Automatic Server-Side Validation

* An S3 event triggers a Lambda function
* The file’s **actual binary content** is inspected:

  * Images → Pillow
  * Videos → OpenCV
* Files are moved to:

  * `approved/` if valid
  * `rejected/` if invalid
* Validation results are stored in DynamoDB

### 4. Status & Secure Preview

* The frontend requests the validation status
* If approved, a **short-lived pre-signed GET URL** is generated
* Media can be previewed without exposing the bucket

A full, step-by-step explanation is available in the **How it works** page inside the application.

---

## Security Design 🔐

This system is intentionally built with a **zero-trust client model**.

Key security principles:

* The frontend is treated as **untrusted**
* No AWS credentials are ever exposed to the browser
* All access is **temporary, scoped, and auditable**

### Security mechanisms used

* **Pre-signed POST policies** with strict conditions
* **Server-side validation** of actual file content
* **Private S3 buckets** with CloudFront Origin Access Control (OAC)
* **Time-limited presigned URLs** (5-minute expiration) for uploads and previews
* **Least-privilege IAM roles**
* **Automatic lifecycle cleanup** of uploaded files

Even if a user tampers with browser requests, **Amazon S3 enforces the rules and rejects invalid uploads**.

---

## Technology Stack

### Frontend

* React
* Material UI (MUI)
* Hosted on Amazon S3
* Delivered via Amazon CloudFront (OAC + HTTPS)

### Backend

* Amazon API Gateway
* AWS Lambda
* Pre-signed POST & GET generation

### Storage & Processing

* Amazon S3
* Amazon DynamoDB
* S3 Event Triggers
* AWS Lambda with Python libraries:
  * Pillow (image validation)
  * OpenCV (video validation)
  * filetype (content-type detection)

---

## Prerequisites

* AWS Account with appropriate permissions (S3, Lambda, API Gateway, DynamoDB, CloudFront)
* AWS CLI configured
* Node.js 18+ and npm
* Python 3.9+ (for Lambda functions)

---

## Local Development

### Frontend

```bash
cd smu-frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### Configuration

Update the API Gateway endpoint in `smu-frontend/src/api.js`:

```javascript
const API_BASE = 'https://your-api-id.execute-api.us-east-1.amazonaws.com';
```

---

## Deployment

### Infrastructure Components

1. **S3 Buckets**
   * Media storage bucket: `secure-cloud-native-media-upload-pipeline`
   * Frontend hosting bucket (CloudFront origin)

2. **DynamoDB Table**
   * Table name: `MediaUploads`
   * Primary key: `media_id` (String)

3. **Lambda Functions**
   * `generateUploadUrl` - Creates presigned POST policies
   * `imageValidator` - Server-side content validation
   * `getMediaStatus` - Returns validation status and preview URLs

4. **API Gateway**
   * REST API with two endpoints:
     * `POST /generate-upload-url`
     * `POST /media-status`

5. **CloudFront Distribution**
   * Origin: Frontend S3 bucket
   * Origin Access Control (OAC) enabled
   * HTTPS only

### Lambda Dependencies

The validation Lambda requires these Python libraries (typically packaged as Lambda Layers):

```
Pillow>=10.0.0
opencv-python-headless>=4.8.0
filetype>=1.2.0
boto3>=1.28.0
```

**Note:** Due to size constraints, package these as a Lambda Layer or use a container image deployment.

### S3 Bucket Configuration

**Security Checklist:**
- ✅ Block all public access
- ✅ Enable versioning
- ✅ Server-side encryption (AES-256 or KMS)
- ✅ CORS configured for direct uploads:
  ```json
  {
    "AllowedOrigins": ["https://your-cloudfront-domain.com"],
    "AllowedMethods": ["POST", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
  ```
- ✅ S3 Event Notifications enabled (trigger `imageValidator` Lambda on `s3:ObjectCreated:*` in `incoming/` prefix)
- ✅ Lifecycle policy for automatic cleanup:
  * Delete objects in `approved/` and `rejected/` after 7 days
  * Tag objects with `keep=false` for cleanup

### IAM Permissions

**generateUploadUrl Lambda:**
- `s3:PutObject` (for presigned POST generation)

**imageValidator Lambda:**
- `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:PutObjectTagging`
- `dynamodb:PutItem`

**getMediaStatus Lambda:**
- `dynamodb:GetItem`
- `s3:GetObject` (for presigned GET URL generation)

---

## Cost Considerations

This architecture is designed to be cost-efficient for small to medium workloads:

| Service | Pricing Model | Estimated Cost (10K uploads/month) |
|---------|--------------|------------------------------------|
| **S3** | Storage + requests | ~$1 |
| **Lambda** | Invocations + duration | ~$2 (within free tier) |
| **API Gateway** | Requests | ~$0.04 |
| **DynamoDB** | On-demand | ~$0.30 |
| **CloudFront** | Data transfer | ~$1 |

**Estimated monthly cost:** < $5 for 10,000 uploads

**Free Tier Coverage:**
- Lambda: 1M requests/month + 400,000 GB-seconds
- API Gateway: 1M requests/month (first 12 months)
- DynamoDB: 25 GB storage + 25 WCU + 25 RCU
- CloudFront: 1 TB data transfer/month (first 12 months)

---

## Testing

### Security Test Cases

Test the security mechanisms by attempting:

| Test Case | Expected Result |
|-----------|----------------|
| ✅ Valid JPEG/PNG/WEBP | Approved |
| ✅ Valid MP4/WEBM/MOV | Approved |
| ❌ Text file renamed to `.jpg` | Rejected (content validation) |
| ❌ Executable renamed to `.png` | Rejected (content validation) |
| ❌ File exceeding 50MB | Rejected by S3 (presigned policy) |
| ❌ Wrong Content-Type header | Rejected by S3 (presigned policy) |
| ❌ Upload after 5 minutes | Rejected (expired presigned URL) |
| ❌ Corrupted image file | Rejected (Pillow validation fails) |
| ❌ Video with 0 frames | Rejected (OpenCV validation fails) |

### Testing Workflow

1. Upload a valid image → Should move to `approved/` folder
2. Check DynamoDB → Record should have `status: approved`
3. Request status → Should receive presigned preview URL
4. Wait 5 minutes → Preview URL should expire
5. Upload invalid file → Should move to `rejected/` folder with reason

---

## Design Decisions & Tradeoffs

This project intentionally prioritizes **clarity, security, and correctness** over feature completeness.

### Intentional limitations

* No authentication layer (focus is on upload pipeline security)
* Polling-based status checks instead of push notifications
* Single-region deployment
* Lambda size limits constrain max validation size

These tradeoffs keep the system easy to reason about while still demonstrating real-world patterns.

---


## What This Project Demonstrates

* Secure direct-to-S3 upload patterns
* Zero-trust frontend architecture
* Server-side media validation
* Practical AWS security best practices
* Clear separation of responsibilities
* Production-style cloud system design

---

## Troubleshooting

**Upload fails immediately:**
- Check CORS configuration on S3 bucket
- Verify API Gateway endpoint URL is correct
- Ensure file size is under 50MB

**File stuck in "incoming" folder:**
- Check S3 Event Notification is configured
- Verify Lambda has execution permissions
- Review CloudWatch Logs for validation errors

**Status check returns 404:**
- File may still be processing (wait a few seconds)
- DynamoDB record may not exist
- Check `media_id` matches uploaded file name

**Preview URL doesn't work:**
- URL expires after 5 minutes
- Check S3 bucket permissions for Lambda
- Verify file is in `approved/` folder

---

<div align="center">

**Built with ☁️ on AWS | Engineered for Security**

*A portfolio project demonstrating production-grade serverless architecture*

</div>


