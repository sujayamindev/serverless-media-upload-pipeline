locals {
  lambda_runtime                 = "python3.11"
  lambda_image_validator_runtime = "python3.12"
  lambda_timeout                 = 300
}

# ─── Package each Lambda as a zip ────────────────────────────────────────────

data "archive_file" "generate_upload_url" {
  type        = "zip"
  source_file = "${path.root}/../lambda/generateUploadUrl/lambda_function.py"
  output_path = "${path.root}/.terraform/zips/generateUploadUrl.zip"
}

data "archive_file" "get_media_status" {
  type        = "zip"
  source_file = "${path.root}/../lambda/getMediaStatus/lambda_function.py"
  output_path = "${path.root}/.terraform/zips/getMediaStatus.zip"
}

data "archive_file" "image_validator" {
  type        = "zip"
  source_dir  = "${path.root}/../lambda/imageValidator/"
  output_path = "${path.root}/.terraform/zips/imageValidator.zip"
}


# ─── generateUploadUrl ───────────────────────────────────────────────────────

resource "aws_lambda_function" "generate_upload_url" {
  function_name    = "generateUploadUrl"
  role             = aws_iam_role.generate_upload_url.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = local.lambda_runtime
  timeout          = 30
  filename         = data.archive_file.generate_upload_url.output_path
  source_code_hash = data.archive_file.generate_upload_url.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.media.id
      API_KEY     = var.api_key
    }
  }
  tags = local.tags
}

# ─── imageValidator ──────────────────────────────────────────────────────────

resource "aws_lambda_function" "image_validator" {
  function_name    = "imageValidator"
  role             = aws_iam_role.image_validator.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = local.lambda_image_validator_runtime
  timeout          = local.lambda_timeout
  memory_size      = 1024
  filename         = data.archive_file.image_validator.output_path
  source_code_hash = data.archive_file.image_validator.output_base64sha256

  layers = var.validator_layer_arns

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.media.id
    }
  }
  tags = local.tags
}

resource "aws_lambda_permission" "allow_s3_invoke" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.image_validator.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.media.arn
}


# ─── getMediaStatus ──────────────────────────────────────────────────────────

resource "aws_lambda_function" "get_media_status" {
  function_name    = "getMediaStatus"
  role             = aws_iam_role.get_media_status.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = local.lambda_runtime
  timeout          = 30
  filename         = data.archive_file.get_media_status.output_path
  source_code_hash = data.archive_file.get_media_status.output_base64sha256

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.media.id
      TABLE_NAME  = aws_dynamodb_table.media_uploads.name
      API_KEY     = var.api_key
    }
  }
  tags = local.tags
}