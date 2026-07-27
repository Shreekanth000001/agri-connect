"""baseline foundational core tables

Revision ID: 000_baseline
Revises: 
Create Date: 2026-07-26 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '000_baseline'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create User table
    op.create_table(
        'User',
        sa.Column('uid', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('uname', sa.String(), nullable=False),
        sa.Column('uemail', sa.String(), nullable=False),
        sa.Column('password', sa.String(), server_default='', nullable=False),
        sa.Column('uphone', sa.String(), server_default='', nullable=False),
        sa.Column('ugeo', sa.String(), nullable=False),
        sa.Column('uloc', sa.String(), server_default='', nullable=False),
        sa.Column('role', sa.String(), server_default='FARMER', nullable=False),
        sa.Column('ujoinedAt', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('uid'),
        sa.UniqueConstraint('uemail')
    )

    # 2. Create ProductAuction table
    op.create_table(
        'ProductAuction',
        sa.Column('ProdAucId', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('fid', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('startingBid', sa.Float(), nullable=False),
        sa.Column('startTime', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('endTime', sa.DateTime(), nullable=False),
        sa.Column('auctionStatus', sa.String(), server_default='OPEN', nullable=False),
        sa.Column('category', sa.String(), server_default='OTHER', nullable=False),
        sa.Column('imageUrl', sa.JSON(), server_default='[]', nullable=False),
        sa.Column('CreatedAt', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['fid'], ['User.uid'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('ProdAucId')
    )

    # 3. Create BidId table
    op.create_table(
        'BidId',
        sa.Column('bidId', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('aucId', sa.Integer(), nullable=False),
        sa.Column('cid', sa.Integer(), nullable=False),
        sa.Column('fid', sa.Integer(), nullable=False),
        sa.Column('bidAmount', sa.Float(), nullable=False),
        sa.Column('bidTime', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('deliveryDate', sa.DateTime(), nullable=True),
        sa.Column('status', sa.String(), server_default='PENDING', nullable=False),
        sa.Column('ujoinedAt', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['aucId'], ['ProductAuction.ProdAucId'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['cid'], ['User.uid'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['fid'], ['User.uid'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('bidId')
    )

    # 4. Create ContactMessage table
    op.create_table(
        'ContactMessage',
        sa.Column('msgId', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), server_default='UNREAD', nullable=False),
        sa.Column('createdAt', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('msgId')
    )


def downgrade() -> None:
    op.drop_table('ContactMessage')
    op.drop_table('BidId')
    op.drop_table('ProductAuction')
    op.drop_table('User')
