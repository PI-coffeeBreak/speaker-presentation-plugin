from dependencies.database import Base
from sqlalchemy import Column, Integer, String, Text, ForeignKey

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    role = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)