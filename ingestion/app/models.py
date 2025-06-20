from sqlalchemy import Column, Integer,String,ForeignKey,Boolean
from db import Base


class Service(Base):
    __tablename__ = "services"
    service_id = Column(Integer, primary_key=True)
    service_name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False)
    owner_id = Column(Integer, nullable=False)
    flag = Column(Boolean,default=True)
