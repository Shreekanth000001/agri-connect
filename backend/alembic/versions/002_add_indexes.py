"""add performance indexes for auctions, bids, and chat

Revision ID: 002_add_indexes
Revises: 001_add_chat
Create Date: 2026-07-27 20:30:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '002_add_indexes'
down_revision: Union[str, None] = '001_add_chat'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. ProductAuction Indexes
    op.create_index('ix_product_auction_fid', 'ProductAuction', ['fid'], if_not_exists=True)
    op.create_index('ix_product_auction_status_cat', 'ProductAuction', ['auctionStatus', 'category'], if_not_exists=True)
    op.create_index('ix_product_auction_created_at', 'ProductAuction', ['CreatedAt'], if_not_exists=True)

    # 2. BidId Indexes
    op.create_index('ix_bid_auc_id', 'BidId', ['aucId'], if_not_exists=True)
    op.create_index('ix_bid_cid', 'BidId', ['cid'], if_not_exists=True)
    op.create_index('ix_bid_fid', 'BidId', ['fid'], if_not_exists=True)
    op.create_index('ix_bid_status', 'BidId', ['status'], if_not_exists=True)

    # 3. Message & Conversation Indexes
    op.create_index('ix_message_conversation_id', 'Message', ['conversation_id'], if_not_exists=True)
    op.create_index('ix_message_sender_id', 'Message', ['sender_id'], if_not_exists=True)
    op.create_index('ix_conversation_farmer_id', 'Conversation', ['farmer_id'], if_not_exists=True)
    op.create_index('ix_conversation_consumer_id', 'Conversation', ['consumer_id'], if_not_exists=True)

    # 4. ProductKnowledge Indexes
    op.create_index('ix_knowledge_category', 'ProductKnowledge', ['category'], if_not_exists=True)
    op.create_index('ix_knowledge_topic', 'ProductKnowledge', ['topic'], if_not_exists=True)


def downgrade() -> None:
    op.drop_index('ix_knowledge_topic', table_name='ProductKnowledge', if_exists=True)
    op.drop_index('ix_knowledge_category', table_name='ProductKnowledge', if_exists=True)
    op.drop_index('ix_conversation_consumer_id', table_name='Conversation', if_exists=True)
    op.drop_index('ix_conversation_farmer_id', table_name='Conversation', if_exists=True)
    op.drop_index('ix_message_sender_id', table_name='Message', if_exists=True)
    op.drop_index('ix_message_conversation_id', table_name='Message', if_exists=True)
    op.drop_index('ix_bid_status', table_name='BidId', if_exists=True)
    op.drop_index('ix_bid_fid', table_name='BidId', if_exists=True)
    op.drop_index('ix_bid_cid', table_name='BidId', if_exists=True)
    op.drop_index('ix_bid_auc_id', table_name='BidId', if_exists=True)
    op.drop_index('ix_product_auction_created_at', table_name='ProductAuction', if_exists=True)
    op.drop_index('ix_product_auction_status_cat', table_name='ProductAuction', if_exists=True)
    op.drop_index('ix_product_auction_fid', table_name='ProductAuction', if_exists=True)
