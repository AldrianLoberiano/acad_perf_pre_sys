"""add section and teacher to students

Revision ID: b9de9d2d4f1a
Revises: 1c5806cf23b1
Create Date: 2026-03-29 12:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "b9de9d2d4f1a"
down_revision = "1c5806cf23b1"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("students", sa.Column("section", sa.String(length=64), nullable=True))
    op.add_column("students", sa.Column("teacher", sa.String(length=120), nullable=True))


def downgrade():
    op.drop_column("students", "teacher")
    op.drop_column("students", "section")
