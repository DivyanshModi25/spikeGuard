from sqlalchemy import Column, Integer,String,ForeignKey,DateTime,Boolean
from db import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    flag = Column(Boolean,default=True)


class Aggregate(Base):
    __tablename__ = "aggregates"

    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    log_count = Column(Integer, default=0)
    error_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
