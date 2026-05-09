variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Base name used for all resources"
  type        = string
  default     = "secure-cloud-native-media-upload-pipeline"
}

variable "max_file_size_bytes" {
  description = "Maximum allowed upload size in bytes"
  type        = number
  default     = 52428800  # 50 MB
}

variable "validator_layer_arns" {
  description = "ARNs of Lambda Layers for the imageValidator function"
  type        = list(string)
  default     = []
}

variable "api_key" {
  description = "API key for frontend authentication"
  type        = string
  sensitive   = true
}

variable "frontend_domain" {
  description = "Custom domain for the frontend (optional)"
  type        = string
  default     = ""
}

variable "cloudfront_waf_arn" {
  description = "WAF ARN auto-created by CloudFront — find in AWS Console > WAF > Web ACLs"
  type        = string
}