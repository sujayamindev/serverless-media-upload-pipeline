import json
import sys
import os
import pytest
import boto3
from moto import mock_aws
from decimal import Decimal
import importlib.util, os

def _load():
    path = os.path.join(os.path.dirname(__file__), "..", "getMediaStatus", "lambda_function.py")
    spec = importlib.util.spec_from_file_location("get_media_status_fn", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

BUCKET_NAME = "secure-cloud-native-media-upload-pipeline"
TABLE_NAME = "MediaUploads"


def _create_resources():
    """Helper: create mocked S3 bucket and DynamoDB table."""
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket=BUCKET_NAME)

    dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
    table = dynamodb.create_table(
        TableName=TABLE_NAME,
        KeySchema=[{"AttributeName": "media_id", "KeyType": "HASH"}],
        AttributeDefinitions=[{"AttributeName": "media_id", "AttributeType": "S"}],
        BillingMode="PAY_PER_REQUEST",
    )
    table.wait_until_exists()
    return s3, table


@mock_aws
def test_approved_file_returns_preview_url(aws_credentials):
    """Approved file should include a presigned preview URL."""
    lambda_function = _load()

    s3, table = _create_resources()

    # Put a fake approved file in S3
    file_key = "approved/test.jpg"
    s3.put_object(Bucket=BUCKET_NAME, Key=file_key, Body=b"fake image data")

    # Write approved record to DynamoDB
    table.put_item(Item={
        "media_id": "test.jpg",
        "status": "approved",
        "final_key": file_key,
        "content_type": "image/jpeg",
        "file_size": "1024",
        "original_key": "incoming/test.jpg",
        "created_at": "2024-01-01T00:00:00Z",
        "checked_at": "2024-01-01T00:00:01Z",
    })

    event = {"body": json.dumps({"media_id": "test.jpg"})}
    result = lambda_function.lambda_handler(event, {})

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["status"] == "approved"
    assert body["preview_url"] is not None
    assert "X-Amz-Signature" in body["preview_url"]  # Presigned URL marker


@mock_aws
def test_rejected_file_has_no_preview_url(aws_credentials):
    """Rejected file should return status but no preview URL."""
    lambda_function = _load()

    _, table = _create_resources()

    table.put_item(Item={
        "media_id": "bad.jpg",
        "status": "rejected",
        "final_key": "rejected/bad.jpg",
        "content_type": "image/jpeg",
        "file_size": "512",
        "original_key": "incoming/bad.jpg",
        "rejection_reason": "Corrupted or invalid image",
        "created_at": "2024-01-01T00:00:00Z",
        "checked_at": "2024-01-01T00:00:01Z",
    })

    event = {"body": json.dumps({"media_id": "bad.jpg"})}
    result = lambda_function.lambda_handler(event, {})

    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["status"] == "rejected"
    assert body["preview_url"] is None
    assert body["rejection_reason"] == "Corrupted or invalid image"


@mock_aws
def test_missing_media_id(aws_credentials):
    """Request without media_id should return 400."""
    lambda_function = _load()

    _create_resources()

    event = {"body": "{}"}
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_nonexistent_media_id(aws_credentials):
    """Request for unknown media_id should return 404."""
    lambda_function = _load()

    _create_resources()

    event = {"body": json.dumps({"media_id": "does-not-exist.jpg"})}
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 404


@mock_aws
def test_response_contains_expected_fields(aws_credentials):
    """Response should contain all expected metadata fields."""
    lambda_function = _load()

    s3, table = _create_resources()
    s3.put_object(Bucket=BUCKET_NAME, Key="approved/meta.png", Body=b"data")

    table.put_item(Item={
        "media_id": "meta.png",
        "status": "approved",
        "final_key": "approved/meta.png",
        "content_type": "image/png",
        "file_size": "2048",
        "original_key": "incoming/meta.png",
        "created_at": "2024-01-01T00:00:00Z",
        "checked_at": "2024-01-01T00:00:01Z",
    })

    event = {"body": json.dumps({"media_id": "meta.png"})}
    result = lambda_function.lambda_handler(event, {})
    body = json.loads(result["body"])

    expected_fields = ["media_id", "status", "content_type", "file_size",
                       "original_key", "final_key", "created_at", "checked_at", "preview_url"]
    for field in expected_fields:
        assert field in body, f"Missing field: {field}"