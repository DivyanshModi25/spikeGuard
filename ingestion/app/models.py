from sqlalchemy import Column, Integer,String,ForeignKey
from db import Base

class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)