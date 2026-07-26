from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.contact import MessageStatus

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

class ContactMessage(ContactMessageCreate):
    msgId: int
    status: MessageStatus
    createdAt: datetime
    
    model_config = {"from_attributes": True}
