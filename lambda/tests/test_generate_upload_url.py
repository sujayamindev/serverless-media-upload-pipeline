import json
import sys
import os
import pytest
from moto import mock_aws
import boto3
import importlib.util, os

def _load():
    path = os.path.join(os.path.dirname(__file__), "..", "generateUploadUrl", "lambda_function.py")
    spec = importlib.util.spec_from_file_location("generate_upload_url_fn", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

@mock_aws
def test_valid_jpeg_request(aws_credentials):
    """Happy path: valid JPEG filename and size returns presigned POST."""
    lambda_function = _load()

    event = {
        "body": json.dumps({"filename": "photo.jpg", "filesize": 1024 * 500})  # 500 KB
    }

    # Patch the bucket name to match mocked bucket
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=lambda_function.BUCKET_NAME)

    result = lambda_function.lambda_handler(event, {})

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert "media_id" in body
    assert "upload" in body
    assert "url" in body["upload"]
    assert "fields" in body["upload"]
    assert body["media_id"].endswith(".jpg")


@mock_aws
def test_valid_mp4_request(aws_credentials):
    """Happy path: valid MP4 file returns presigned POST with video/mp4 content type."""
    lambda_function = _load()

    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=lambda_function.BUCKET_NAME)

    event = {
        "body": json.dumps({"filename": "clip.mp4", "filesize": 1024 * 1024 * 10})  # 10 MB
    }

    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["media_id"].endswith(".mp4")


def test_missing_filename(aws_credentials):
    """Missing filename should return 400."""
    lambda_function = _load()

    event = {"body": json.dumps({"filesize": 1024})}
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


def test_missing_filesize(aws_credentials):
    """Missing filesize should return 400."""
    lambda_function = _load()

    event = {"body": json.dumps({"filename": "photo.jpg"})}
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


def test_file_too_large(aws_credentials):
    """File exceeding 50 MB should return 400."""
    lambda_function = _load()

    event = {
        "body": json.dumps({
            "filename": "huge.jpg",
            "filesize": 1024 * 1024 * 100  # 100 MB
        })
    }
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400
    assert "large" in json.loads(result["body"]).lower()


def test_invalid_extension(aws_credentials):
    """Non-allowed extension (e.g. .exe) should return 400."""
    lambda_function = _load()

    event = {
        "body": json.dumps({"filename": "malware.exe", "filesize": 1024})
    }
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


def test_unsupported_extension(aws_credentials):
    """Text file extension should be rejected."""
    lambda_function = _load()

    event = {
        "body": json.dumps({"filename": "document.pdf", "filesize": 1024})
    }
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400

@mock_aws
def test_webp_is_allowed(aws_credentials):
    """WebP format should be accepted."""
    lambda_function = _load()

    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=lambda_function.BUCKET_NAME)

    event = {
        "body": json.dumps({"filename": "image.webp", "filesize": 1024 * 100})
    }
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 200


def test_empty_body(aws_credentials):
    """Empty body should return 400."""
    lambda_function = _load()

    event = {"body": "{}"}
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400