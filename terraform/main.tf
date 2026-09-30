terraform {
  required_version = ">= 1.5"
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

  # Optional: remote state in S3
  # backend "s3" {
  #   bucket = "your-tf-state-bucket"
  #   key    = "cloud-pipeline/terraform.tfstate"
  #   region = "us-east-1"
  # }
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