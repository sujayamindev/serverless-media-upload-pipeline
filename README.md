<div align="center">

# Secure Cloud-Native Media Upload Pipeline

A serverless, security-first media upload pipeline built on AWS.<br/>
Files go directly from the browser to S3 — the backend never touches the file bytes.

[![CI](https://github.com/sujayamindev/secure-cloud-native-media-upload-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/sujayamindev/secure-cloud-native-media-upload-pipeline/actions/workflows/ci.yml)
![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iODAwIiBmaWxsPSIjZmZmIiB2aWV3Qm94PSIwIDAgMzIgMzIiPjxwYXRoIGQ9Ik02LjU4NCA5LjAxYy0xLjM2IDAtMi43NC41My0yLjk3LjgyLS4wNi4xMi0uMiAxLjA5LjEzIDEuMDkuMTEgMCAuMTYuMDIuNDgtLjEzIDEuMi0uNDcgMS45Ni0uNDYgMi4wNy0uNDYgMS4zNS0uMTMgMi4xMy43OSAyLjAxIDEuOTh2LjdjLTEuMTQtLjI3LTEuNzktLjI4LTIuMTEtLjI4LTEuNjYtLjEtMy4xOTQuNzc2LTMuMTk0IDIuNyAwIDIuMTEgMS44ODMgMi41NiAyLjYxMyAyLjUzIDEuMDkuMDEgMi4xMy0uNDggMi44Mi0xLjMzLjU1IDEuMjMuOSAxLjE1LjkxIDEuMTUuMSAwIC4xOC0uMDQuMjYtLjA5bC41Ny0uNGMuMS0uMDYuMTgtLjE2LjE5LS4yOC0uMDEtLjI5LS41My0uNzQtLjQ5LTEuNzV2LTMuMTJhMy4xOCAzLjE4IDAgMCAwLS43OTktMi4zNSAzLjQyIDMuNDIgMCAwIDAtMi40OS0uNzhtMTkuMzczIDBjLTIgMC0zLjE1IDEuMjUtMy4xMiAyLjUyIDAgMS43NCAxLjc2IDIuMjkgMS45NiAyLjM1IDEuNjkuNTMgMS45Mi41NSAyLjM5Ljk1LjQuNDEuMzUgMS4yMS0uMjQgMS41Ni0uMTcuMS0uOS41NC0yLjU1LjItLjU1LS4xMS0uODQtLjI0LTEuMjktLjQzLS4xMi0uMDQtLjQtLjExLS40LjI2di40OWMwIC4yMy4xNC40NC4zNS41NCAxLjA1LjUzIDIuMzEuNTUgMi41OC41NS4wNCAwIDIuMzQuMDAxIDMuMTEtMS41NS4xNTgtLjMyLjU3LTEuNDktLjItMi40OS0uNjQtLjc1LTEuMTktLjgzLTIuODMtMS4zMy0uMTQtLjA0LTEuMzUtLjM1LTEuMzQtMS4yLS4wNi0xLjA5IDEuNDItMS4xNSAxLjczLTEuMTMgMS4yNS0uMDIgMS44Ny40NSAyLjIxLjQ4LjE1IDAgLjIyLS4wOS4yMi0uMjl2LS40NmEuNS41IDAgMCAwLS4wOS0uMzFjLS40LS41Mi0xLjkzLS43MS0yLjQ5LS43MW0tMTUuMTguMjVjLS4xMS4wMi0uMTkuMTMtLjE3LjI0LjAyLjEzLjA0LjI2LjA5LjM5bDIuMjQgNy4zOWMuMDUuMjQuMjEuNS41Ni40NmguODJjLjUuMDUuNTctLjQzLjU4LS40OGwxLjQ3LTYuMTYgMS40OSA2LjE3Yy4wMS4wNS4wOC41My41Ny40OGguODNjLjM2LjA0LjUzLS4yMi41OC0uNDYgMi41Mi04LjExIDIuMzUtNy41NiAyLjM3LTcuNjQuMDQtLjQyLS4yLS4zOS0uMjQtLjM4aC0uODljLS40NS0uMDUtLjU0LjM2LS41Ni40NmwtMS42NiA2LjQxLTEuNS02LjQxYy0uMDctLjQ5LS40Ny0uNDctLjU3LS40NmgtLjc3Yy0uNDQtLjA0LS41NS4zMS0uNTguNDZsLTEuNDkgNi4zMi0xLjYtNi4zMmMtLjA0LS4yLS4xNy0uNTEtLjU2LS40N3ptLTQuMjU0IDQuNjNjLjcyLjAxIDEuMzQyLjEyIDEuNzcyLjIyIDAgLjUuMDE4Ljc4LS4wOTIgMS4yMy0uMTQuNDgtLjc1OSAxLjM1LTIuMjE5IDEuMzctLjg0LjA0LTEuMzktLjYyLTEuMzQtMS4zNy0uMDUtMS4yIDEuMTktMS41IDEuODgtMS40NW0yMi41MTggNi4xMTJjLS45MzMuMDEzLTIuMDM1LjIyMi0yLjg3MS44MDktLjI1OC4xNzktLjIxMy40MjcuMDc0LjM5NC45NC0uMTEzIDMuMDMyLS4zNjcgMy40MDYuMTExcy0uNDE0IDIuNDUtLjc2MyAzLjMzMmMtLjEwOC4yNjMuMTIuMzcyLjM2MS4xNzIgMS41NjQtMS4zMSAxLjk3LTQuMDU2IDEuNjUtNC40NS0uMTYtLjE5OC0uOTI0LS4zODEtMS44NTctLjM2OG0tMjcuODI0IDFjLS4yMTguMDMtLjMxMi4zMDYtLjA4NC41MjVDNS4wNSAyNS4yMDEgMTAuMjI2IDI3IDE1Ljk3MyAyN2M0LjA5OSAwIDguODU3LTEuMzM3IDEyLjE0Mi0zLjg1Ny41NDMtLjQyLjA4LTEuMDQ3LS40NzYtLjgtMy42ODMgMS42MjYtNy42ODQgMi40MDktMTEuMzI1IDIuNDA5LTUuMzk2IDAtMTAuNjItMS4xMjctMTQuODQ1LTMuNjg2YS40LjQgMCAwIDAtLjI1Mi0uMDY0Ii8+PC9zdmc+)
![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

**[🔗 Live Demo](https://d2mt0cnx8t9hcw.cloudfront.net)**

</div>

---

## Table of Contents

- [The Problem](#the-problem)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Security Design](#security-design)
- [Repository Structure](#repository-structure)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [CI/CD](#cicd)
- [Test Coverage](#test-coverage)
- [Cost](#cost)
- [Design Decisions](#design-decisions)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## The Problem

Traditional upload systems route file bytes through a backend server. This creates three compounding problems: the server becomes a bottleneck for large files, client-side validation is trivially bypassed by renaming files or forging MIME types, and long-lived credentials increase the blast radius of any compromise.

This project solves all three using AWS-native patterns.

---

## Architecture

![Architecture Diagram](docs/diagram.svg)

### Flow

| Step | What happens |
|------|-------------|
| **1** | Frontend calls API Gateway → `generateUploadUrl` Lambda → returns a short-lived presigned POST policy |
| **2** | Browser uploads the file directly to S3 (`incoming/`) using the presigned policy — backend is bypassed entirely |
| **3** | S3 `ObjectCreated` event triggers `imageValidator` Lambda → validates binary content → moves file to `approved/` or `rejected/` → writes result to DynamoDB |
| **4** | Frontend auto-polls API Gateway → `getMediaStatus` Lambda → reads DynamoDB → returns status and a presigned GET URL for preview |

The backend is **never involved in file transfer**. S3 enforces all upload constraints at the infrastructure level.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Material UI 7, Vite — hosted on S3, delivered via CloudFront (OAC) |
| **API** | Amazon API Gateway (HTTP API) — JWT authorizer backed by Amazon Cognito User Pool |
| **Compute** | AWS Lambda (Python 3.12) — `generateUploadUrl`, `imageValidator`, `getMediaStatus` |
| **Storage** | Amazon S3 — lifecycle rules, event triggers, presigned URLs |
| **Database** | Amazon DynamoDB — validation status and file metadata |
| **Amazon SQS** | Dead-letter queue for imageValidator async invocation failures — captures S3 event payloads after Lambda exhausts retries so failed validations can be inspected and replayed |
| **IaC** | Terraform — all resources defined as code |
| **CI** | GitHub Actions — Lambda tests, frontend lint/build, Terraform validation |

---

## Security Design

> [!NOTE]
> This system uses a **zero-trust client model** — the frontend is treated as untrusted throughout. No AWS credentials are ever exposed to the browser.

| Mechanism | Protection |
|-----------|-----------|
| **Presigned POST policy** | Enforces file size, content type, upload path, and 5-minute expiration at the S3 level — tampered requests are rejected by S3 itself |
| **Binary content validation** | `filetype` checks magic numbers (not extensions) → Pillow verifies image integrity → OpenCV reads video frames — catches renamed executables and forged MIME types |
| **Cognito JWT authentication** | All API Gateway routes require a valid Bearer token from the Cognito User Pool — unauthenticated or expired tokens are rejected at the gateway before any Lambda is invoked |
| **Per-user upload isolation** | Every upload record stores the uploader's `user_sub` (Cognito subject claim) — `getMediaStatus` returns 403 if the requesting user does not match the record owner |
| **Private S3 + OAC** | Bucket is inaccessible directly — frontend access goes through CloudFront, Lambda access through IAM roles only |
| **Least-privilege IAM roles** | Each Lambda has its own scoped role — `generateUploadUrl` can only `s3:PutObject` on `incoming/*` |
| **Presigned GET URLs** | Approved files previewed via short-lived signed URLs — bucket is never public |
| **Automatic lifecycle cleanup** | `incoming/` expires after 1 day, `approved/` and `rejected/` after 7 days |
| **CloudFront security headers** | A CloudFront viewer-response Function injects HSTS (1 year), X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, and a strict Content-Security-Policy on every response |

---

## Repository Structure

<details>
<summary>Click to expand</summary>

```
.
├── frontend/                   # React application
│   ├── src/
│   │   ├── auth/
│   │   │   ├── cognito.js
│   │   │   ├── AuthContext.jsx
│   │   │   └── (AuthPage is in pages/)
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx
│   │   │   ├── HowItWorksPage.jsx
│   │   │   └── AuthPage.jsx
│   │   └── api.js
│   ├── .env.example
│   └── package.json
├── lambda/                     # Lambda function source code
│   ├── generateUploadUrl/
│   │   └── lambda_function.py
│   ├── imageValidator/
│   │   └── lambda_function.py
│   ├── getMediaStatus/
│   │   └── lambda_function.py
│   ├── tests/                  # pytest + moto test suite (27 tests)
│   │   ├── conftest.py
│   │   ├── test_generate_upload_url.py
│   │   ├── test_get_media_status.py
│   │   └── test_image_validator.py
│   ├── requirements-dev.txt
│   └── pytest.ini
├── terraform/                  # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── s3.tf
│   ├── lambda.tf
│   ├── api_gateway.tf
│   ├── dynamodb.tf
│   ├── cloudfront.tf
│   ├── cloudfront_function.tf
│   ├── cognito.tf
│   ├── iam.tf
│   └── terraform.tfvars.example
├── docs/
│   └── diagram.svg
└── .github/
    └── workflows/
        └── ci.yml
```

</details>

---

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- AWS CLI configured (`aws configure`)
- Terraform 1.5+

### Frontend

```bash
cd frontend
cp .env.example .env
# Fill in VITE_API_BASE_URL, VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID
npm install
npm run dev
# → http://localhost:5173
```

### Lambda tests

```bash
cd lambda
pip install -r requirements-dev.txt
pytest tests/ -v --cov=generateUploadUrl --cov=getMediaStatus --cov=imageValidator
```

---

## Deployment

> [!IMPORTANT]
> All AWS infrastructure is managed with Terraform. A single `terraform apply` creates and configures every resource — S3 buckets, Lambda functions, API Gateway, DynamoDB, CloudFront, and IAM roles.

### Step 1 — Configure variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

| Variable | Description |
|----------|-------------|
| `aws_region` | AWS region to deploy into |
| `project_name` | Base name for all resources — must be globally unique (used as S3 bucket name) |
| `cloudfront_waf_arn` | WAF ARN if your CloudFront distribution requires one |
| `validator_layer_arns` | ARNs of Lambda layers for Pillow, OpenCV, and filetype |

### Step 2 — Lambda layers

The `imageValidator` Lambda requires Pillow, OpenCV, and filetype as Lambda layers built for `python3.12` on Amazon Linux 2.

**Option A — Use public KLayers (recommended)**

The [KLayers project](https://github.com/keithrozario/Klayers) publishes pre-built Lambda layers. Find the Pillow ARN for `python3.12` in your region and add it to `terraform.tfvars`.

**Option B — Build your own**

```bash
mkdir -p lambda_layer/python

docker run --rm \
  -v "$PWD/lambda_layer:/out" \
  public.ecr.aws/lambda/python:3.12 \
  pip install Pillow opencv-python-headless filetype \
  --target /out/python --quiet

cd lambda_layer && zip -r ../validator-layer.zip python/

aws lambda publish-layer-version \
  --layer-name validator-dependencies \
  --zip-file fileb://validator-layer.zip \
  --compatible-runtimes python3.12 \
  --region us-east-1
```

### Step 3 — Deploy infrastructure

```bash
cd terraform
terraform init
terraform plan    # review what will be created
terraform apply
```

Copy the outputs into `frontend/.env`:

```bash
terraform output api_gateway_url                    # → VITE_API_BASE_URL
terraform output -raw cognito_user_pool_id          # → VITE_COGNITO_USER_POOL_ID
terraform output -raw cognito_client_id             # → VITE_COGNITO_CLIENT_ID
terraform output cloudfront_domain                  # → your live URL
```

### Step 4 — Deploy the frontend

```bash
cd frontend
npm run build
aws s3 sync dist/ s3://YOUR_FRONTEND_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Importing existing resources

<details>
<summary>If you have manually created AWS resources, import them before applying</summary>

```bash
terraform import aws_s3_bucket.media               YOUR_BUCKET_NAME
terraform import aws_dynamodb_table.media_uploads  MediaUploads
terraform import aws_lambda_function.generate_upload_url  generateUploadUrl
terraform import aws_lambda_function.image_validator      imageValidator
terraform import aws_lambda_function.get_media_status     getMediaStatus
terraform import aws_apigatewayv2_api.main         YOUR_API_ID
terraform import aws_cloudfront_distribution.frontend  YOUR_DISTRIBUTION_ID
terraform import aws_sqs_queue.image_validator_dlq     YOUR_QUEUE_URL
terraform import aws_cognito_user_pool.main            YOUR_USER_POOL_ID
terraform import aws_cognito_user_pool_client.main     YOUR_USER_POOL_ID/YOUR_CLIENT_ID
```

</details>

---

## CI/CD

GitHub Actions runs three jobs on every push to `main` or `develop`:

| Job | What it checks |
|-----|---------------|
| **Lambda tests** | 27 pytest tests with moto mocks — enforces 70% coverage floor |
| **Frontend** | ESLint + Vite production build with placeholder env vars |
| **Terraform validate** | `terraform init`, `validate`, `tflint`, and `fmt -check` |

> [!NOTE]
> CD is intentionally manual via `terraform apply` locally. Automated deployment from a public repository requires OIDC-based authentication with a scoped deploy role — a straightforward addition for a team environment.

---

## Test Coverage

<details>
<summary>View all 27 test scenarios</summary>

| Scenario | Lambda | Result |
|----------|--------|:------:|
| Valid JPEG/PNG/WebP upload request | `generateUploadUrl` | ✅ |
| Valid MP4 upload request | `generateUploadUrl` | ✅ |
| Valid WebP upload request | `generateUploadUrl` | ✅ |
| File exceeds 50 MB | `generateUploadUrl` | ❌ 400 |
| Disallowed extension (`.exe`, `.pdf`) | `generateUploadUrl` | ❌ 400 |
| Unsupported extension (`.pdf`) rejected | `generateUploadUrl` | ❌ 400 |
| Missing filename or filesize | `generateUploadUrl` | ❌ 400 |
| Missing filesize | `generateUploadUrl` | ❌ 400 |
| Request with missing JWT | `generateUploadUrl` | ❌ 401 |
| DynamoDB record includes user_sub on upload | `generateUploadUrl` | ✅ |
| Malformed JSON body | `generateUploadUrl` | ❌ 400 |
| Approved file returns presigned URL | `getMediaStatus` | ✅ |
| Rejected file returns rejection reason | `getMediaStatus` | ✅ |
| Unknown media ID | `getMediaStatus` | ❌ 404 |
| Cross-account media_id request | `getMediaStatus` | ❌ 403 |
| Legacy record without user_sub | `getMediaStatus` | ❌ 403 |
| Request with missing JWT | `getMediaStatus` | ❌ 401 |
| Response contains all expected metadata fields | `getMediaStatus` | ✅ |
| Malformed JSON body | `getMediaStatus` | ❌ 400 |
| Real JPEG binary approved | `imageValidator` | ✅ → `approved/` |
| Real PNG binary approved | `imageValidator` | ✅ → `approved/` |
| Fake JPEG (wrong magic bytes) | `imageValidator` | ❌ → `rejected/` |
| Corrupted image | `imageValidator` | ❌ → `rejected/` |
| File over size limit | `imageValidator` | ❌ → `rejected/` |
| Disallowed extension | `imageValidator` | ❌ → `rejected/` |
| DynamoDB record created for approved file | `imageValidator` | ✅ |
| Processing error moves file to rejected | `imageValidator` | ❌ → `rejected/` |

</details>

---

## Cost

Designed for cost-efficiency on low-to-medium traffic. Most costs fall within AWS free tier limits for new accounts.

| Service | Pricing model | ~10K uploads/month |
|---------|:------------:|:-----------------:|
| S3 | Storage + requests | ~$1.00 |
| Lambda | Invocations + duration | ~$2.00 |
| API Gateway | Per request | ~$0.04 |
| DynamoDB | PAY_PER_REQUEST | ~$0.30 |
| CloudFront | Data transfer | ~$1.00 |
| **Total** | | **< $5.00** |

---

## Design Decisions

<details>
<summary><strong>Why presigned POST instead of presigned PUT?</strong></summary>

Presigned PUT allows size enforcement only at the IAM/bucket policy level. Presigned POST supports a `content-length-range` condition that S3 enforces directly, rejecting oversized uploads before any bytes are stored. It also allows strict content-type enforcement per upload.

</details>

<details>
<summary><strong>Why poll instead of push for validation status?</strong></summary>

Push notifications (SNS → WebSocket or FCM) would require additional infrastructure. For a single-user demo, polling every 3 seconds with graceful 404 handling achieves the same result with no extra components. The frontend handles 404 responses silently — they mean the validator hasn't finished yet, not that an error occurred.

</details>

<details>
<summary><strong>Why separate IAM roles per Lambda?</strong></summary>

Each function is scoped to exactly the permissions it needs. `generateUploadUrl` can only write to `incoming/`, `getMediaStatus` can only read from `approved/` and query DynamoDB. A compromise of one function cannot be used to access resources belonging to another.

</details>

<details>
<summary><strong>Production hardening not included</strong></summary>

- **Malware scanning** — AWS GuardDuty S3 Malware Protection would add a scan-tag check before file approval. Omitted to avoid the cost of the WAF/malware subscription required for CloudFront distributions.
- **Push notifications** — FCM integration for instant validation results instead of polling.
- **Transcoding** — MOV files are served as a download link on non-Safari browsers rather than transcoded to MP4. An ffmpeg Lambda layer would handle this in production.
- **Multi-region deployment** — single region keeps costs and complexity low for a demo.

</details>

---

## Troubleshooting

<details>
<summary><strong>Upload fails with 403</strong></summary>

- Verify Cognito env vars (`VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_AWS_REGION`) are correctly set in `frontend/.env` and the frontend has been rebuilt and redeployed

</details>

<details>
<summary><strong>File stuck in <code>incoming/</code> folder</strong></summary>

- Check S3 event notification is configured (Terraform manages this — verify in the AWS console)
- Check CloudWatch logs: `aws logs tail /aws/lambda/imageValidator --since 10m`
- Verify Lambda layers are compatible with `python3.12`

</details>

<details>
<summary><strong>Status check returns 404 immediately after upload</strong></summary>

This is expected — `imageValidator` is still running. The frontend handles 404s silently and keeps polling. If it persists beyond 30 seconds, check `imageValidator` logs.

</details>

<details>
<summary><strong>Preview URL doesn't load</strong></summary>

- Presigned GET URLs expire after 5 minutes
- Verify the file is in `approved/`, not `rejected/`
- Check `getMediaStatus` Lambda role has `s3:GetObject` on `approved/*`

</details>

<details>
<summary><strong><code>terraform apply</code> fails on CloudFront</strong></summary>

If your distribution has a WAF subscription plan, AWS requires `web_acl_id` to be present — it cannot be removed. Add the WAF ARN to `terraform.tfvars` as `cloudfront_waf_arn`.

</details>

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**[🔗 Live Demo](https://d2mt0cnx8t9hcw.cloudfront.net)**

If you found this project useful, consider giving it a ⭐

<sub>Built on AWS &nbsp;·&nbsp; Managed with Terraform &nbsp;·&nbsp; Tested with pytest &nbsp;·&nbsp; © 2026 Sujaya Mindev</sub>

</div>