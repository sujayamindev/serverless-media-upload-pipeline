import json
import os
import importlib.util

import boto3
from moto import mock_aws

TEST_USER_SUB = "test-user-sub-123"
BUCKET_NAME = "secure-cloud-native-media-upload-pipeline"
TABLE_NAME = "MediaUploads"


def _load():
    path = os.path.join(os.path.dirname(__file__), "..", "generateUploadUrl", "lambda_function.py")
    spec = importlib.util.spec_from_file_location("generate_upload_url_fn", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _event(body, *, user_sub=TEST_USER_SUB, include_auth=True):
    evt = {"body": body if isinstance(body, str) else json.dumps(body)}
    if include_auth:
        evt["requestContext"] = {
            "authorizer": {
                "jwt": {
                    "claims": {"sub": user_sub}
                }
            }
        }
    return evt


def _create_resources():
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
def test_valid_jpeg_request(aws_credentials):
    """Happy path: valid JPEG filename and size returns presigned POST."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "photo.jpg", "filesize": 1024 * 500})  # 500 KB
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
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "clip.mp4", "filesize": 1024 * 1024 * 10})  # 10 MB
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 200
    body = json.loads(result["body"])
    assert body["media_id"].endswith(".mp4")


@mock_aws
def test_user_sub_persisted_to_dynamodb(aws_credentials):
    """user_sub from JWT claims is stored on the new DynamoDB record."""
    _, table = _create_resources()
    lambda_function = _load()

    event = _event({"filename": "photo.jpg", "filesize": 1024 * 100}, user_sub="alice-sub")
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 200
    media_id = json.loads(result["body"])["media_id"]

    item = table.get_item(Key={"media_id": media_id}).get("Item")
    assert item is not None
    assert item["user_sub"] == "alice-sub"
    assert item["status"] == "pending"


@mock_aws
def test_missing_filename(aws_credentials):
    """Missing filename should return 400."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filesize": 1024})
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_missing_filesize(aws_credentials):
    """Missing filesize should return 400."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "photo.jpg"})
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_file_too_large(aws_credentials):
    """File exceeding 50 MB should return 400."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "huge.jpg", "filesize": 1024 * 1024 * 100})  # 100 MB
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400
    assert "large" in json.loads(result["body"]).lower()


@mock_aws
def test_invalid_extension(aws_credentials):
    """Non-allowed extension (e.g. .exe) should return 400."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "malware.exe", "filesize": 1024})
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_unsupported_extension(aws_credentials):
    """Text file extension should be rejected."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "document.pdf", "filesize": 1024})
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_webp_is_allowed(aws_credentials):
    """WebP format should be accepted."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "image.webp", "filesize": 1024 * 100})
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 200


@mock_aws
def test_empty_body(aws_credentials):
    """Empty body should return 400."""
    _create_resources()
    lambda_function = _load()

    event = _event("{}")
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 400


@mock_aws
def test_missing_jwt_returns_401(aws_credentials):
    """Request without JWT claims context should return 401."""
    _create_resources()
    lambda_function = _load()

    event = _event({"filename": "photo.jpg", "filesize": 1024}, include_auth=False)
    result = lambda_function.lambda_handler(event, {})
    assert result["statusCode"] == 401
