from datetime import datetime
from pydantic import BaseModel, EmailStr, model_validator
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
    id: int | None = None
    name: str | None = None
    email: str | None = None
    ujoinedAt: datetime
    
    @model_validator(mode="after")
    def set_user_aliases(self) -> "UserInDBBase":
        self.id = self.uid
        self.name = self.uname
        self.email = str(self.uemail)
        return self

    model_config = {"from_attributes": True}

class User(UserInDBBase):
    pass
