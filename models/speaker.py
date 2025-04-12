from dependencies.database import Base
from sqlalchemy import Column, Integer, String, Text, JSON

class Speaker(Base):
    __tablename__ = "speakers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image = Column(String, nullable=False)
    contacts = Column(JSON, nullable=True)