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