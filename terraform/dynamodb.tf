resource "aws_dynamodb_table" "media_uploads" {
  name         = "MediaUploads"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "media_id"

  deletion_protection_enabled = true

  attribute {
    name = "media_id"
    type = "S"
  }

  tags = local.tags
}