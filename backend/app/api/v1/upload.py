import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.api.deps import CurrentUser

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "/home/critic-coder/project/AI_Assisted_Projects/agri-connect-v2/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/image")
async def upload_image(
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        content = await file.read()
        await out_file.write(content)

    return {
        "url": f"/uploads/{filename}",
        "public_id": filename
    }
