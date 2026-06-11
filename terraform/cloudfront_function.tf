resource "aws_cloudfront_function" "security_headers" {
  name    = "${var.project_name}-security-headers"
  runtime = "cloudfront-js-2.0"
  publish = true
  comment = "Adds security response headers (HSTS, X-Frame-Options, CSP, etc.) on the viewer-response."
  code    = <<-EOT
    function handler(event) {
      var response = event.response;
      var headers = response.headers;

      headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubDomains' };
      headers['x-frame-options'] = { value: 'DENY' };
      headers['x-content-type-options'] = { value: 'nosniff' };
      headers['referrer-policy'] = { value: 'strict-origin' };
      headers['content-security-policy'] = { value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://a.b.cdn.console.awsstatic.com https://upload.wikimedia.org https://serverless-media-upload-pipeline.s3.us-east-1.amazonaws.com https://serverless-media-upload-pipeline.s3.amazonaws.com; media-src 'self' https://serverless-media-upload-pipeline.s3.us-east-1.amazonaws.com https://serverless-media-upload-pipeline.s3.amazonaws.com; connect-src 'self' https://oqw0a4j9b8.execute-api.us-east-1.amazonaws.com https://cognito-idp.us-east-1.amazonaws.com https://serverless-media-upload-pipeline.s3.us-east-1.amazonaws.com https://serverless-media-upload-pipeline.s3.amazonaws.com; frame-ancestors 'none';" };

      return response;
    }
  EOT

  lifecycle {
    create_before_destroy = true
  }
}
