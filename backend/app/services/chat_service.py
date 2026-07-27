from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.models.user import User, Role
from app.models.auction import ProductAuction
from app.repositories.chat_repository import chat_repository
from app.schemas.chat import ConversationCreate, ConversationResponse, MessageResponse, MessageCreate

class ChatService:
    async def get_user_conversations(self, db: AsyncSession, user_id: int) -> list[ConversationResponse]:
        conversations = await chat_repository.get_user_conversations(db, user_id)
        responses = []
        for conv in conversations:
            last_msg = conv.messages[-1] if conv.messages else None
            last_msg_resp = MessageResponse.model_validate(last_msg) if last_msg else None
            if last_msg_resp:
                last_msg_resp.is_me = (last_msg.sender_id == user_id)
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
        if last_msg_resp:
            last_msg_resp.is_me = (last_msg.sender_id == user_id)
        resp = ConversationResponse.model_validate(conv)
        resp.last_message = last_msg_resp
        return resp

    async def create_or_get_conversation(
        self, db: AsyncSession, current_user: User, conv_in: ConversationCreate
    ) -> ConversationResponse:
        farmer_id = conv_in.farmer_id if conv_in.farmer_id and conv_in.farmer_id > 0 else None
        consumer_id = conv_in.consumer_id if conv_in.consumer_id and conv_in.consumer_id > 0 else None
        product_id = conv_in.product_id if conv_in.product_id and conv_in.product_id > 0 else None

        # Determine farmer_id and consumer_id if underspecified
        if not farmer_id and not consumer_id:
            if conv_in.participant_user_id and conv_in.participant_user_id > 0:
                target_user = await db.get(User, conv_in.participant_user_id)
                if not target_user:
                    raise HTTPException(status_code=404, detail="Target participant user not found")
                if current_user.role == Role.FARMER:
                    farmer_id = current_user.uid
                    consumer_id = target_user.uid
                else:
                    consumer_id = current_user.uid
                    farmer_id = target_user.uid
            else:
                raise HTTPException(status_code=400, detail="Must specify farmer_id and consumer_id")
        elif farmer_id and not consumer_id:
            consumer_id = current_user.uid
        elif consumer_id and not farmer_id:
            farmer_id = current_user.uid

        if farmer_id == consumer_id:
            raise HTTPException(status_code=400, detail="Farmer and consumer cannot be the same user")

        # Validate farmer & consumer users exist
        farmer = await db.get(User, farmer_id)
        if not farmer:
            raise HTTPException(status_code=404, detail="Farmer not found")

        consumer = await db.get(User, consumer_id)
        if not consumer:
            raise HTTPException(status_code=404, detail="Consumer not found")

        # Validate product_id if provided
        if product_id is not None:
            product = await db.get(ProductAuction, product_id)
            if not product:
                raise HTTPException(status_code=404, detail="Product auction not found")

        # Check if conversation already exists for (product_id, farmer_id, consumer_id)
        existing = await chat_repository.find_existing_conversation(
            db, farmer_id=farmer_id, consumer_id=consumer_id, product_id=product_id
        )
        if existing:
            return ConversationResponse.model_validate(existing)

        # Create new conversation with race condition handling
        try:
            conv = await chat_repository.create_conversation(
                db, farmer_id=farmer_id, consumer_id=consumer_id, product_id=product_id
            )
            return ConversationResponse.model_validate(conv)
        except IntegrityError:
            await db.rollback()
            existing = await chat_repository.find_existing_conversation(
                db, farmer_id=farmer_id, consumer_id=consumer_id, product_id=product_id
            )
            if existing:
                return ConversationResponse.model_validate(existing)
            raise

    async def get_messages(
        self, db: AsyncSession, conversation_id: int, current_user_id: int, limit: int = 50, offset: int = 0
    ) -> list[MessageResponse]:
        conv = await chat_repository.get_conversation(db, conversation_id, current_user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied")

        messages = await chat_repository.get_messages(db, conversation_id, limit=limit, offset=offset)
        result = []
        for m in messages:
            resp = MessageResponse.model_validate(m)
            resp.is_me = (m.sender_id == current_user_id)
            result.append(resp)
        return result

    async def send_message(
        self, db: AsyncSession, conversation_id: int, current_user_id: int, message_in: MessageCreate
    ) -> MessageResponse:
        conv = await chat_repository.get_conversation(db, conversation_id, current_user_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found or access denied")

        content_str = message_in.content or message_in.text or ""
        msg = await chat_repository.create_message(
            db, conversation_id, current_user_id, content_str, offer=message_in.offer
        )
        resp = MessageResponse.model_validate(msg)
        resp.is_me = True
        return resp

chat_service = ChatService()
