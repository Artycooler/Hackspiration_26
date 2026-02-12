"""Pydantic schemas for data validation"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


class PropertyCreate(BaseModel):
    address: str
    owner_id: str
    photos: Optional[List[str]] = []
    monthly_rent: float = Field(gt=0)
    deposit_required: float = Field(gt=0)
    bedrooms: int = Field(ge=0)
    bathrooms: int = Field(ge=0)
    square_feet: float = Field(gt=0)
    property_type: str  # apartment, house, condo
    
    class Config:
        json_schema_extra = {
            "example": {
                "address": "123 Main St, NYC",
                "owner_id": "owner1",
                "monthly_rent": 2500,
                "deposit_required": 5000,
                "bedrooms": 2,
                "bathrooms": 1,
                "square_feet": 1000,
                "property_type": "apartment"
            }
        }


class PropertyResponse(PropertyCreate):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    photos: Optional[List[str]] = []
    
    class Config:
        from_attributes = True


class TenantCreate(BaseModel):
    property_id: int
    wallet_address: str
    name: str
    email: EmailStr
    credit_score: Optional[float] = 0
    
    class Config:
        json_schema_extra = {
            "example": {
                "property_id": 1,
                "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f42778",
                "name": "John Doe",
                "email": "john@example.com",
                "credit_score": 750
            }
        }


class TenantResponse(TenantCreate):
    id: int
    move_in_date: Optional[datetime]
    reputation_score: float
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class MaintenanceRequestCreate(BaseModel):
    property_id: int
    tenant_id: int
    issue_description: str
    urgency: str = Field(default="medium")  # low, medium, high, critical
    estimated_cost: Optional[float] = None


class MaintenanceRequestResponse(MaintenanceRequestCreate):
    id: int
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TransactionCreate(BaseModel):
    property_id: int
    tenant_id: int
    transaction_type: str
    amount: float = Field(gt=0)


class TransactionResponse(TransactionCreate):
    id: int
    status: str
    blockchain_hash: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskAssessmentResponse(BaseModel):
    tenant_id: Optional[int]
    property_id: Optional[int]
    risk_score: float
    risk_level: str
    factors: dict
    recommendation: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class AnalyticsResponse(BaseModel):
    total_properties: int
    total_tenants: int
    total_revenue: float
    occupancy_rate: float
    average_property_risk: float
    average_tenant_risk: float
    maintenance_requests: int
    pending_transactions: int


class PortfolioStatsResponse(BaseModel):
    portfolio_score: float
    avg_property_risk: float
    avg_tenant_risk: float
    occupancy_rate: float
    property_count: int
    tenant_count: int
    vacancy_rate: float
