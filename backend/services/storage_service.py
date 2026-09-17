import boto3
import uuid
from config import Config


s3 = boto3.client(
    "s3",
    aws_access_key_id=Config.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=Config.AWS_SECRET_ACCESS_KEY,
    region_name=Config.AWS_REGION
)


def upload_file(file_obj, original_filename, folder, content_type):
    extension = original_filename.rsplit(".", 1)[-1]

    unique_filename = f"{uuid.uuid4()}.{extension}"

    s3_key = f"{folder}/{unique_filename}"

    s3.upload_fileobj(
        file_obj,
        Config.S3_BUCKET_NAME,
        s3_key,
        ExtraArgs={
            "ContentType": content_type
        }
    )

    return s3_key

def generate_presigned_url(s3_key, expiration=3600):
    url = s3.generate_presigned_url(
        "get_object",
        Params={
            "Bucket": Config.S3_BUCKET_NAME,
            "Key": s3_key
        },
        ExpiresIn=expiration
    )

    return url