from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.chat import Conversation, ConversationParticipant, Message

class ChatRepository:
    async def get_user_conversations(self, db: AsyncSession, user_id: int) -> list[Conversation]:
        # Subquery to get conversation IDs for the user
        stmt = (
            select(Conversation)
            .join(ConversationParticipant)
            .where(ConversationParticipant.user_id == user_id)
            .options(
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
            .order_by(Conversation.updated_at.desc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_conversation(self, db: AsyncSession, conversation_id: int, user_id: int) -> Conversation | None:
        stmt = (
            select(Conversation)
            .join(ConversationParticipant)
            .where(
                and_(
                    Conversation.id == conversation_id,
                    ConversationParticipant.user_id == user_id
                )
            )
            .options(
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def find_existing_conversation(self, db: AsyncSession, user_id_1: int, user_id_2: int) -> Conversation | None:
        # Find conversation where both user_id_1 and user_id_2 are participants
        p1 = select(ConversationParticipant.conversation_id).where(ConversationParticipant.user_id == user_id_1)
        p2 = select(ConversationParticipant.conversation_id).where(ConversationParticipant.user_id == user_id_2)
        
        stmt = (
            select(Conversation)
            .where(Conversation.id.in_(p1) & Conversation.id.in_(p2))
            .options(
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_conversation(self, db: AsyncSession, user_id_1: int, user_id_2: int) -> Conversation:
        conversation = Conversation()
        db.add(conversation)
        await db.flush()

        participant1 = ConversationParticipant(conversation_id=conversation.id, user_id=user_id_1)
        participant2 = ConversationParticipant(conversation_id=conversation.id, user_id=user_id_2)
        db.add_all([participant1, participant2])
        await db.commit()
        await db.refresh(conversation)

        # Reload relationships
        return await self.get_conversation(db, conversation.id, user_id_1) # type: ignore

    async def get_messages(self, db: AsyncSession, conversation_id: int, limit: int = 50, offset: int = 0) -> list[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(selectinload(Message.sender))
            .order_by(Message.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def create_message(self, db: AsyncSession, conversation_id: int, sender_id: int, content: str) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content
        )
        db.add(message)
        
        # Update conversation updated_at timestamp
        conversation = await db.get(Conversation, conversation_id)
        if conversation:
            db.add(conversation)
            
        await db.commit()
        await db.refresh(message)
        
        # Reload sender relationship
        stmt = select(Message).where(Message.id == message.id).options(selectinload(Message.sender))
        res = await db.execute(stmt)
        return res.scalars().first() # type: ignore

chat_repository = ChatRepository()
