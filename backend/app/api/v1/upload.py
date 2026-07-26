from fastapi import APIRouter, Depends, UploadFile, File
from app.api.deps import CurrentUser

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/image")
async def upload_image(
    current_user: CurrentUser,
    file: UploadFile = File(...)
):
    return {
        "url": f"https://res.cloudinary.com/demo/image/upload/{file.filename}",
        "public_id": file.filename
    }
