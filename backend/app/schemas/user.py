from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import Role

class UserBase(BaseModel):
    uname: str
    uemail: EmailStr
    uphone: str = ""
    ugeo: str
    uloc: str = ""
    role: Role = Role.FARMER

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    uname: str | None = None
    uphone: str | None = None
    ugeo: str | None = None
    uloc: str | None = None

class UserInDBBase(UserBase):
    uid: int
    ujoinedAt: datetime
    
    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass
