"""Database models and initialization for RentWise"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./rentwise.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String, unique=True, index=True)
    owner_id = Column(String, index=True)
    monthly_rent = Column(Float)
    deposit_required = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    square_feet = Column(Float)
    property_type = Column(String)  # apartment, house, condo
    status = Column(String, default="available")  # available, rented, maintenance
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    photos_json = Column("photos", Text, nullable=True)

    tenants = relationship("Tenant", back_populates="property")
    transactions = relationship("Transaction", back_populates="property")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="property")

    @property
    def photos(self):
        try:
            if self.photos_json:
                return __import__("json").loads(self.photos_json)
        except Exception:
            return []
        return []

    @photos.setter
    def photos(self, value):
        try:
            self.photos_json = __import__("json").dumps(value or [])
        except Exception:
            self.photos_json = None


class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    wallet_address = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    move_in_date = Column(DateTime)
    move_out_date = Column(DateTime, nullable=True)
    credit_score = Column(Float, default=0)
    reputation_score = Column(Float, default=50)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    property = relationship("Property", back_populates="tenants")
    transactions = relationship("Transaction", back_populates="tenant")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="tenant")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    transaction_type = Column(String)  # rent, deposit, refund, penalty
    amount = Column(Float)
    status = Column(String, default="pending")  # pending, completed, failed
    blockchain_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    property = relationship("Property", back_populates="transactions")
    tenant = relationship("Tenant", back_populates="transactions")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    issue_description = Column(Text)
    urgency = Column(String)  # low, medium, high, critical
    status = Column(String, default="open")  # open, in_progress, resolved
    estimated_cost = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    property = relationship("Property", back_populates="maintenance_requests")
    tenant = relationship("Tenant", back_populates="maintenance_requests")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    risk_score = Column(Float)
    risk_level = Column(String)  # LOW, MEDIUM, HIGH, CRITICAL
    factors = Column(Text)  # JSON string of risk factors
    recommendation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
