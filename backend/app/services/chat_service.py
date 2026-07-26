from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.repositories.chat_repository import chat_repository
from app.schemas.chat import ConversationResponse, MessageResponse, MessageCreate

class ChatService:
    async def get_user_conversations(self, db: AsyncSession, user_id: int) -> list[ConversationResponse]:
        conversations = await chat_repository.get_user_conversations(db, user_id)
        responses = []
        for conv in conversations:
            last_msg = conv.messages[-1] if conv.messages else None
            last_msg_resp = MessageResponse.model_validate(last_msg) if last_msg else None
            resp = ConversationResponse.model_validate(conv)
            resp.last_message = last_msg_resp
            responses.append(resp)
        return responses

    async def get_conversation_by_id(self, db: AsyncSession, conversation_id: int, user_id: int) -> ConversationResponse:
        conv = await chat_repository.get_conversation(db, conversation_id, user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied")
        last_msg = conv.messages[-1] if conv.messages else None
        last_msg_resp = MessageResponse.model_validate(last_msg) if last_msg else None
        resp = ConversationResponse.model_validate(conv)
        resp.last_message = last_msg_resp
        return resp

    async def create_or_get_conversation(self, db: AsyncSession, current_user_id: int, target_user_id: int) -> ConversationResponse:
        if current_user_id == target_user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot start a conversation with yourself")

        # Verify target user exists
        target_user = await db.get(User, target_user_id)
        if not target_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

        # Check if conversation already exists
        existing = await chat_repository.find_existing_conversation(db, current_user_id, target_user_id)
        if existing:
            return ConversationResponse.model_validate(existing)

        # Create new conversation
        conv = await chat_repository.create_conversation(db, current_user_id, target_user_id)
        return ConversationResponse.model_validate(conv)

    async def get_messages(self, db: AsyncSession, conversation_id: int, current_user_id: int, limit: int = 50, offset: int = 0) -> list[MessageResponse]:
        # Check authorization
        conv = await chat_repository.get_conversation(db, conversation_id, current_user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied")

        messages = await chat_repository.get_messages(db, conversation_id, limit=limit, offset=offset)
        return [MessageResponse.model_validate(m) for m in messages]

    async def send_message(self, db: AsyncSession, conversation_id: int, current_user_id: int, message_in: MessageCreate) -> MessageResponse:
        # Check authorization
        conv = await chat_repository.get_conversation(db, conversation_id, current_user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied")

        msg = await chat_repository.create_message(db, conversation_id, current_user_id, message_in.content)
        return MessageResponse.model_validate(msg)

chat_service = ChatService()
