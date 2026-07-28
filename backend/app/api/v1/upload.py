import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.api.deps import CurrentUser

router = APIRouter(prefix="/upload", tags=["upload"])

# Project-relative upload directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

@router.post("/image")
async def upload_image(
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if not ext or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image extension. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 10MB"
        )

    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(content)

    return {
        "url": f"/uploads/{filename}",
        "public_id": filename
    }
