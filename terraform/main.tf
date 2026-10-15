terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # Remote state in S3 with native lockfile locking (Terraform >= 1.10).
  # The bucket name embeds the account ID, so it lives in the gitignored
  # backend.hcl: terraform init -backend-config=backend.hcl
  backend "s3" {
    key          = "smart-media-upload-pipeline/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  tags = {
    Project   = var.project_name
    ManagedBy = "terraform"
  }

  # Browser origins allowed by S3 and API Gateway CORS: the default CloudFront
  # domain, plus the custom domain when frontend_domain is set.
  frontend_origins = concat(
    ["https://${aws_cloudfront_distribution.frontend.domain_name}"],
    var.frontend_domain != "" ? ["https://${var.frontend_domain}"] : []
  )
}