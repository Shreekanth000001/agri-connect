from datetime import datetime
from pydantic import BaseModel
from app.schemas.user import User

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: int
    conversation_id: int
    sender_id: int
    created_at: datetime
    sender: User | None = None

    model_config = {"from_attributes": True}


class ConversationParticipantResponse(BaseModel):
    id: int
    conversation_id: int
    user_id: int
    user: User | None = None

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    participant_user_id: int

class ConversationResponse(BaseModel):
    id: int
    created_at: datetime
    updated_at: datetime
    participants: list[ConversationParticipantResponse] = []
    last_message: MessageResponse | None = None

    model_config = {"from_attributes": True}
