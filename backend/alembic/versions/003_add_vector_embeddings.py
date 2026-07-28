"""add pgvector extension and embedding column to ProductKnowledge

Revision ID: 003_add_vector_embeddings
Revises: 002_add_indexes
Create Date: 2026-07-27 20:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = '003_add_vector_embeddings'
down_revision: Union[str, None] = '002_add_indexes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pgvector extension
    op.execute('CREATE EXTENSION IF NOT EXISTS vector;')

    # 2. Add embedding column to ProductKnowledge
    op.add_column('ProductKnowledge', sa.Column('embedding', Vector(384), nullable=True))


def downgrade() -> None:
    op.drop_column('ProductKnowledge', 'embedding')
