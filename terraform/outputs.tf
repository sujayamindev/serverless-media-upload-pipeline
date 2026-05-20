output "api_gateway_url" {
  description = "Base URL for the API Gateway"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "cloudfront_domain" {
  description = "CloudFront domain name for the frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "media_bucket_name" {
  value = aws_s3_bucket.media.id
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  description = "Cognito User Pool Client ID (for browser-side auth)"
  value       = aws_cognito_user_pool_client.main.id
}

output "image_validator_dlq_url" {
  description = "SQS DLQ for imageValidator failed S3 async invocations"
  value       = aws_sqs_queue.image_validator_dlq.url
}