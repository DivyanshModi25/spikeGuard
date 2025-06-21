from sqlalchemy import Column, Integer,String,ForeignKey,DateTime,Boolean,Float
from db import Base
import datetime

class Developers(Base):
    __tablename__ = "developers"
    dev_id = Column(Integer, primary_key=True)
    dev_name = Column(String(255), nullable=False)
    dev_email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

class Service(Base):
    __tablename__ = "services"
    service_id = Column(Integer, primary_key=True)
    service_name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("developers.dev_id"), nullable=False)
    flag = Column(Boolean,default=True)


class AggregatedMetric(Base):
    __tablename__ = "aggregated_metrics"

    agg_id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, index=True)
    time_bucket = Column(DateTime, index=True)  # e.g. rounded to nearest minute/hour
    total_logs = Column(Integer, default=0)
    error_logs = Column(Integer, default=0)
    uptime_percentage = Column(Float, default=100.0)  # Optional (can be calculated later)

