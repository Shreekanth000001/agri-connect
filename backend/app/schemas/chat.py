from datetime import datetime
from pydantic import BaseModel
from app.models.chat import ConversationStatus
from app.schemas.user import User

from pydantic import BaseModel, model_validator

class MessageCreate(BaseModel):
    content: str | None = None
    text: str | None = None
    offer: dict | None = None

    @model_validator(mode="before")
    @classmethod
    def populate_content(cls, data: dict) -> dict:
        if isinstance(data, dict):
            if not data.get("content") and data.get("text"):
                data["content"] = data["text"]
            if not data.get("content"):
                data["content"] = ""
        return data

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    sender_name: str | None = None
    sender_role: str | None = None
    content: str
    text: str | None = None
    offer: dict | None = None
    created_at: datetime
    timestamp: datetime | None = None
    sender: User | None = None
    is_me: bool | None = None

    @model_validator(mode="after")
    def set_aliases(self) -> "MessageResponse":
        self.text = self.content
        self.timestamp = self.created_at
        if self.sender:
            self.sender_name = self.sender.uname
            self.sender_role = str(self.sender.role.value if hasattr(self.sender.role, 'value') else self.sender.role)
        return self

    model_config = {"from_attributes": True}


class ConversationParticipantResponse(BaseModel):
    id: int
    conversation_id: int
    user_id: int
    user: User | None = None

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    product_id: int | None = None
    farmer_id: int | None = None
    consumer_id: int | None = None
    participant_user_id: int | None = None  # Fallback field for backward compatibility

class ConversationResponse(BaseModel):
    id: int
    product_id: int | None = None
    auction_id: int | None = None
    farmer_id: int
    consumer_id: int
    status: ConversationStatus = ConversationStatus.OPEN
    accepted_bid_id: int | None = None
    created_at: datetime
    updated_at: datetime
    farmer: User | None = None
    consumer: User | None = None
    participants: list[ConversationParticipantResponse] = []
    last_message: MessageResponse | None = None

    # Extra fields expected by Next.js frontend
    product_title: str | None = None
    product_image: str | None = None
    starting_bid: float | None = None
    participant_id: int | None = None
    participant_name: str | None = None
    participant_role: str | None = None
    participant_location: str | None = None

    @model_validator(mode="after")
    def set_frontend_fields(self) -> "ConversationResponse":
        self.auction_id = self.product_id
        if self.farmer:
            self.participant_id = self.farmer.uid
            self.participant_name = self.farmer.uname
            self.participant_role = str(self.farmer.role.value if hasattr(self.farmer.role, 'value') else self.farmer.role)
            self.participant_location = self.farmer.uloc
        elif self.consumer:
            self.participant_id = self.consumer.uid
            self.participant_name = self.consumer.uname
            self.participant_role = str(self.consumer.role.value if hasattr(self.consumer.role, 'value') else self.consumer.role)
            self.participant_location = self.consumer.uloc
        return self

    model_config = {"from_attributes": True}
