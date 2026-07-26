from app.db.base_class import Base

# Import all models here so Alembic can discover them
from app.models.user import User
from app.models.auction import ProductAuction
from app.models.bid import BidId
from app.models.contact import ContactMessage
from app.models.chat import Conversation, ConversationParticipant, Message
