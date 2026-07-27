from pydantic import BaseModel
from app.schemas.user import User

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int | None = None
    user: User | None = None

class TokenPayload(BaseModel):
    uid: int
