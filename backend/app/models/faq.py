"""FAQ / store policy for text retrieval."""
from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(512))
    answer = Column(Text)
