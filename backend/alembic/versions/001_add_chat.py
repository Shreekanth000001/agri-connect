"""add human negotiation chat tables

Revision ID: 001_add_chat
Revises: 
Create Date: 2026-07-26 18:25:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '001_add_chat'
down_revision: Union[str, None] = '000_baseline'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'Conversation',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('farmer_id', sa.Integer(), nullable=False),
        sa.Column('consumer_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), server_default='OPEN', nullable=False),
        sa.Column('accepted_bid_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['product_id'], ['ProductAuction.ProdAucId'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farmer_id'], ['User.uid'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['consumer_id'], ['User.uid'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['accepted_bid_id'], ['BidId.bidId'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('product_id', 'farmer_id', 'consumer_id', name='uq_conversation_product_farmer_consumer')
    )

    op.create_table(
        'ConversationParticipant',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['Conversation.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['User.uid'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'Message',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('offer', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['Conversation.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sender_id'], ['User.uid'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('Message')
    op.drop_table('ConversationParticipant')
    op.drop_table('Conversation')
