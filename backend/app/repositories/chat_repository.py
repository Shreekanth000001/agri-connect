from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.chat import Conversation, ConversationParticipant, Message, ConversationStatus

class ChatRepository:
    async def get_user_conversations(self, db: AsyncSession, user_id: int) -> list[Conversation]:
        stmt = (
            select(Conversation)
            .outerjoin(ConversationParticipant, Conversation.id == ConversationParticipant.conversation_id)
            .where(
                or_(
                    Conversation.farmer_id == user_id,
                    Conversation.consumer_id == user_id,
                    ConversationParticipant.user_id == user_id
                )
            )
            .options(
                selectinload(Conversation.farmer),
                selectinload(Conversation.consumer),
                selectinload(Conversation.product),
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
            .order_by(Conversation.updated_at.desc())
            .distinct()
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_conversation(self, db: AsyncSession, conversation_id: int, user_id: int) -> Conversation | None:
        stmt = (
            select(Conversation)
            .outerjoin(ConversationParticipant, Conversation.id == ConversationParticipant.conversation_id)
            .where(
                and_(
                    Conversation.id == conversation_id,
                    or_(
                        Conversation.farmer_id == user_id,
                        Conversation.consumer_id == user_id,
                        ConversationParticipant.user_id == user_id
                    )
                )
            )
            .options(
                selectinload(Conversation.farmer),
                selectinload(Conversation.consumer),
                selectinload(Conversation.product),
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
            .distinct()
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def find_existing_conversation(
        self, db: AsyncSession, farmer_id: int, consumer_id: int, product_id: int | None = None
    ) -> Conversation | None:
        conditions = [
            Conversation.farmer_id == farmer_id,
            Conversation.consumer_id == consumer_id
        ]
        if product_id is not None:
            conditions.append(Conversation.product_id == product_id)
        else:
            conditions.append(Conversation.product_id.is_(None))

        stmt = (
            select(Conversation)
            .where(and_(*conditions))
            .options(
                selectinload(Conversation.farmer),
                selectinload(Conversation.consumer),
                selectinload(Conversation.product),
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
        )
        result = await db.execute(stmt)
        return result.scalars().first()

    async def create_conversation(
        self, db: AsyncSession, farmer_id: int, consumer_id: int, product_id: int | None = None
    ) -> Conversation:
        conversation = Conversation(
            product_id=product_id,
            farmer_id=farmer_id,
            consumer_id=consumer_id,
            status=ConversationStatus.OPEN
        )
        db.add(conversation)
        await db.flush()

        participant1 = ConversationParticipant(conversation_id=conversation.id, user_id=farmer_id)
        participant2 = ConversationParticipant(conversation_id=conversation.id, user_id=consumer_id)
        db.add_all([participant1, participant2])
        await db.commit()
        await db.refresh(conversation)

        return await self.get_conversation(db, conversation.id, farmer_id) # type: ignore

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

    async def create_message(
        self, db: AsyncSession, conversation_id: int, sender_id: int, content: str, offer: dict | None = None
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
            offer=offer
        )
        db.add(message)
        
        conversation = await db.get(Conversation, conversation_id)
        if conversation:
            db.add(conversation)
            
        await db.commit()
        await db.refresh(message)
        
        stmt = select(Message).where(Message.id == message.id).options(selectinload(Message.sender))
        res = await db.execute(stmt)
        return res.scalars().first() # type: ignore

chat_repository = ChatRepository()
