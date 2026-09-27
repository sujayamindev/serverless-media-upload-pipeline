# Only requested when var.frontend_domain is set — the default empty string would
# otherwise send an empty domain_name, which flips this resource into "import an
# existing cert" mode instead of "request a new one" and fails.
#
# CloudFront requires the cert in us-east-1, which matches var.aws_region's default
# and this project's single-provider setup — no separate provider alias needed.
resource "aws_acm_certificate" "frontend" {
  count = var.frontend_domain != "" ? 1 : 0

  domain_name       = var.frontend_domain
  validation_method = "DNS"
  tags              = local.tags

  lifecycle {
    create_before_destroy = true
  }
}

# DNS for var.frontend_domain may not be in Route 53 (e.g. registered/hosted at a
# registrar like Name.com), so the validation CNAME must be created manually there —
# see the frontend_domain_validation output for the exact name/value to add.
resource "aws_acm_certificate_validation" "frontend" {
  count = var.frontend_domain != "" ? 1 : 0

  certificate_arn = aws_acm_certificate.frontend[0].arn
}
