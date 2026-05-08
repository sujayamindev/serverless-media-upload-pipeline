import io
import sys
import os
import json
import pytest
import boto3
from moto import mock_aws
from PIL import Image
import importlib.util, os

def _load():
    path = os.path.join(os.path.dirname(__file__), "..", "imageValidator", "lambda_function.py")
    spec = importlib.util.spec_from_file_location("image_validator_fn", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

BUCKET_NAME = "secure-cloud-native-media-upload-pipeline"
TABLE_NAME = "MediaUploads"


def _make_real_jpeg_bytes():
    """Create real in-memory JPEG bytes using Pillow."""
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _make_real_png_bytes():
    """Create real in-memory PNG bytes."""
    buf = io.BytesIO()
    img = Image.new("RGB", (50, 50), color=(0, 255, 0))
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_fake_jpeg_bytes():
    """Return bytes that claim to be JPEG but are actually plain text."""
    return b"This is not an image at all"


def _setup_aws():
    """Create mocked S3 bucket and DynamoDB table."""
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
    return s3, dynamodb.Table(TABLE_NAME)


def _make_s3_event(key):
    """Build a minimal S3 event record."""
    return {
        "Records": [{
            "s3": {
                "bucket": {"name": BUCKET_NAME},
                "object": {"key": key},
            },
            "eventTime": "2024-01-01T00:00:00Z",
        }]
    }


@mock_aws
def test_valid_jpeg_is_approved(aws_credentials):
    """A real JPEG file should be approved and moved to approved/ folder."""
    lambda_function = _load()

    s3, table = _setup_aws()
    key = "incoming/valid.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=_make_real_jpeg_bytes(),
        ContentType="image/jpeg",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "valid.jpg"})["Item"]
    assert item["status"] == "approved"
    assert item["final_key"] == "approved/valid.jpg"


@mock_aws
def test_valid_png_is_approved(aws_credentials):
    """A real PNG file should be approved."""
    lambda_function = _load()

    s3, table = _setup_aws()
    key = "incoming/valid.png"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=_make_real_png_bytes(),
        ContentType="image/png",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "valid.png"})["Item"]
    assert item["status"] == "approved"


@mock_aws
def test_fake_jpeg_is_rejected(aws_credentials):
    """A file with .jpg extension but non-image content should be rejected."""
    lambda_function = _load()

    s3, table = _setup_aws()
    key = "incoming/fake.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=_make_fake_jpeg_bytes(),
        ContentType="image/jpeg",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "fake.jpg"})["Item"]
    assert item["status"] == "rejected"
    assert item["final_key"] == "rejected/fake.jpg"
    assert item.get("rejection_reason") is not None


@mock_aws
def test_file_exceeding_size_limit_is_rejected(aws_credentials):
    """A file over 50 MB should be rejected based on size check."""
    lambda_function = _load()

    s3, table = _setup_aws()

    # Create a fake large file (51 MB of zeros)
    large_data = b"\x00" * (51 * 1024 * 1024)
    key = "incoming/toobig.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=large_data,
        ContentType="image/jpeg",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "toobig.jpg"})["Item"]
    assert item["status"] == "rejected"
    assert "large" in item["rejection_reason"].lower()


@mock_aws
def test_invalid_extension_is_rejected(aws_credentials):
    """A file with a disallowed extension should be rejected immediately."""
    lambda_function = _load()

    s3, table = _setup_aws()
    key = "incoming/script.exe"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=b"MZ\x90\x00",  # PE header magic bytes
        ContentType="application/octet-stream",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "script.exe"})["Item"]
    assert item["status"] == "rejected"


@mock_aws
def test_dynamo_record_created_for_approved_file(aws_credentials):
    """Approved file should have a complete DynamoDB record."""
    lambda_function = _load()

    s3, table = _setup_aws()
    key = "incoming/check.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=_make_real_jpeg_bytes(),
        ContentType="image/jpeg",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "check.jpg"})["Item"]
    assert "status" in item
    assert "final_key" in item
    assert "content_type" in item
    assert "file_size" in item
    assert "created_at" in item
    assert "checked_at" in item


@mock_aws
def test_corrupted_image_is_rejected(aws_credentials):
    """A file with JPEG magic bytes but truncated/corrupted data should be rejected."""
    lambda_function = _load()

    s3, table = _setup_aws()

    # JPEG starts with FF D8 but rest is garbage
    corrupted = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    key = "incoming/corrupted.jpg"
    s3.put_object(
        Bucket=BUCKET_NAME,
        Key=key,
        Body=corrupted,
        ContentType="image/jpeg",
    )

    lambda_function.lambda_handler(_make_s3_event(key), {})

    item = table.get_item(Key={"media_id": "corrupted.jpg"})["Item"]
    assert item["status"] == "rejected"