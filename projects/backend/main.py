
"""
RentWise: Advanced Blockchain-Based Rental Property Management System
FastAPI Backend with AI Risk Assessment
"""
from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Request
from fastapi.staticfiles import StaticFiles
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import json

from database import init_db, get_db, Property, Tenant, Transaction, MaintenanceRequest, RiskAssessment
from schemas import (
    PropertyCreate, PropertyResponse,
    TenantCreate, TenantResponse,
    MaintenanceRequestCreate, MaintenanceRequestResponse,
    TransactionCreate, TransactionResponse,
    RiskAssessmentResponse, AnalyticsResponse, PortfolioStatsResponse
)
from advanced_risk import get_risk_engine

# Initialize FastAPI app
app = FastAPI(
    title="RentWise API",
    description="Advanced Blockchain Rental Property Management System with AI Risk Assessment",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup():
    init_db()


# Ensure uploads directory exists for property photos
uploads_path = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(uploads_path, exist_ok=True)

# Serve static uploaded files
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")


# ==================== HEALTH CHECK ====================

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint - verifies backend and database connectivity"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "message": "RentWise Backend is operational",
            "timestamp": datetime.utcnow().isoformat(),
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": str(e),
            "database": "disconnected"
        }


# ==================== PROPERTY ENDPOINTS ====================

@app.post("/api/properties", response_model=PropertyResponse)
def create_property(property: PropertyCreate, db: Session = Depends(get_db)):
    """Create a new rental property"""
    # Check if property already exists
    existing = db.query(Property).filter(Property.address == property.address).first()
    if existing:
        raise HTTPException(status_code=400, detail="Property already exists at this address")
    
    prop_data = property.dict()
    photos = prop_data.pop("photos", None)
    db_property = Property(**prop_data)
    if photos:
        try:
            db_property.photos = photos
        except Exception:
            pass
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property


@app.get("/api/properties", response_model=List[PropertyResponse])
def list_properties(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all properties with optional filtering"""
    query = db.query(Property)
    if status:
        query = query.filter(Property.status == status)
    return query.offset(skip).limit(limit).all()


@app.get("/api/properties/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get specific property details"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@app.put("/api/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_update: PropertyCreate,
    db: Session = Depends(get_db)
):
    """Update property details"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    update_data = property_update.dict()
    photos = update_data.pop("photos", None)
    for key, value in update_data.items():
        setattr(property, key, value)
    if photos is not None:
        try:
            property.photos = photos
        except Exception:
            property.photos_json = None

    property.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(property)
    return property


@app.post("/api/properties/{property_id}/photos")
def upload_property_photos(
    property_id: int,
    request: Request,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Upload one or more photos for a property. Returns updated photos list."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    upload_dir = os.path.join(os.path.dirname(__file__), "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    new_urls = []
    for f in files:
        filename = f.filename or f"photo_{uuid.uuid4().hex}.jpg"
        # sanitize filename
        ext = os.path.splitext(filename)[1] or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        dest_path = os.path.join(upload_dir, unique_name)
        with open(dest_path, "wb") as out_file:
            out_file.write(f.file.read())

        # Build absolute URL
        file_url = f"{request.base_url}static/uploads/{unique_name}"
        new_urls.append(file_url)

    # Append to existing photos
    existing = prop.photos or []
    updated = existing + new_urls
    try:
        prop.photos = updated
    except Exception:
        prop.photos_json = None

    db.commit()
    db.refresh(prop)

    return {"photos": prop.photos}


@app.delete("/api/properties/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    """Delete a property"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    db.delete(property)
    db.commit()
    return {"message": "Property deleted successfully"}


# ==================== TENANT ENDPOINTS ====================

@app.post("/api/tenants", response_model=TenantResponse)
def create_tenant(tenant: TenantCreate, db: Session = Depends(get_db)):
    """Add a new tenant to a property"""
    # Verify property exists
    property = db.query(Property).filter(Property.id == tenant.property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if tenant already exists
    existing = db.query(Tenant).filter(Tenant.email == tenant.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant email already registered")
    
    db_tenant = Tenant(
        **tenant.dict(),
        move_in_date=datetime.utcnow()
    )
    db.add(db_tenant)
    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@app.get("/api/tenants", response_model=List[TenantResponse])
def list_tenants(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """List all tenants"""
    query = db.query(Tenant)
    if active_only:
        query = query.filter(Tenant.is_active == True)
    return query.all()


@app.get("/api/properties/{property_id}/tenants", response_model=List[TenantResponse])
def get_property_tenants(property_id: int, db: Session = Depends(get_db)):
    """Get all tenants for a specific property"""
    return db.query(Tenant).filter(Tenant.property_id == property_id).all()


@app.get("/api/tenants/{tenant_id}", response_model=TenantResponse)
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    """Get specific tenant details"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


# ==================== TRANSACTION ENDPOINTS ====================

@app.post("/api/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Record a transaction (payment, deposit, refund)"""
    # Verify property and tenant
    property = db.query(Property).filter(Property.id == transaction.property_id).first()
    tenant = db.query(Tenant).filter(Tenant.id == transaction.tenant_id).first()
    
    if not property or not tenant:
        raise HTTPException(status_code=404, detail="Property or tenant not found")
    
    db_transaction = Transaction(**transaction.dict(), status="pending")
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@app.get("/api/transactions", response_model=List[TransactionResponse])
def list_transactions(
    status: Optional[str] = None,
    transaction_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List transactions with optional filtering"""
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status)
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type)
    return query.all()


@app.get("/api/tenants/{tenant_id}/transactions", response_model=List[TransactionResponse])
def get_tenant_transactions(tenant_id: int, db: Session = Depends(get_db)):
    """Get all transactions for a specific tenant"""
    return db.query(Transaction).filter(Transaction.tenant_id == tenant_id).all()


@app.put("/api/transactions/{transaction_id}/confirm")
def confirm_transaction(transaction_id: int, blockchain_hash: str, db: Session = Depends(get_db)):
    """Confirm a transaction with blockchain hash"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    transaction.status = "completed"
    transaction.blockchain_hash = blockchain_hash
    db.commit()
    db.refresh(transaction)
    return {"message": "Transaction confirmed", "transaction": transaction}


# ==================== MAINTENANCE ENDPOINTS ====================

@app.post("/api/maintenance", response_model=MaintenanceRequestResponse)
def create_maintenance_request(
    request: MaintenanceRequestCreate,
    db: Session = Depends(get_db)
):
    """Create a new maintenance request"""
    property = db.query(Property).filter(Property.id == request.property_id).first()
    tenant = db.query(Tenant).filter(Tenant.id == request.tenant_id).first()
    
    if not property or not tenant:
        raise HTTPException(status_code=404, detail="Property or tenant not found")
    
    db_request = MaintenanceRequest(**request.dict())
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request


@app.get("/api/maintenance", response_model=List[MaintenanceRequestResponse])
def list_maintenance_requests(
    status: Optional[str] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List maintenance requests"""
    query = db.query(MaintenanceRequest)
    if status:
        query = query.filter(MaintenanceRequest.status == status)
    if urgency:
        query = query.filter(MaintenanceRequest.urgency == urgency)
    return query.all()


@app.put("/api/maintenance/{request_id}/status")
def update_maintenance_status(
    request_id: int,
    new_status: str,
    db: Session = Depends(get_db)
):
    """Update maintenance request status"""
    maintenance = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance request not found")
    
    maintenance.status = new_status
    if new_status == "resolved":
        maintenance.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(maintenance)
    return {"message": "Status updated", "maintenance": maintenance}


# ==================== RISK ASSESSMENT ENDPOINTS ====================

@app.post("/api/risk/assess-tenant", response_model=RiskAssessmentResponse)
def assess_tenant_risk(tenant_id: int, db: Session = Depends(get_db)):
    """Assess risk for a specific tenant"""
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Get tenant transaction history
    transactions = db.query(Transaction).filter(Transaction.tenant_id == tenant_id).all()
    late_payments = len([t for t in transactions if t.status == "failed"])
    payment_failures = late_payments
    
    # Gather tenant data
    credit_score = tenant.credit_score or 0
    dispute_count = 0  # You can track this separately
    tenure_months = (datetime.utcnow() - tenant.move_in_date).days // 30
    
    # Calculate risk
    risk_engine = get_risk_engine()
    score, level, factors = risk_engine.calculate_tenant_risk(
        payment_delays=0,
        payment_failures=payment_failures,
        credit_score=credit_score,
        dispute_count=dispute_count,
        tenure_months=tenure_months,
        previous_evictions=0
    )
    
    recommendations = risk_engine.get_risk_recommendations(score, level)
    
    # Save assessment
    assessment = RiskAssessment(
        tenant_id=tenant_id,
        risk_score=score,
        risk_level=level,
        factors=json.dumps(factors),
        recommendation=json.dumps(recommendations)
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    return {
        "tenant_id": tenant_id,
        "property_id": None,
        "risk_score": score,
        "risk_level": level,
        "factors": factors,
        "recommendation": recommendations,
        "created_at": assessment.created_at
    }


@app.post("/api/risk/assess-property", response_model=RiskAssessmentResponse)
def assess_property_risk(property_id: int, db: Session = Depends(get_db)):
    """Assess risk for a specific property"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get property data
    maintenance_issues = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.property_id == property_id
    ).count()
    
    risk_engine = get_risk_engine()
    score, level, factors = risk_engine.calculate_property_risk(
        property_age_years=0,
        maintenance_issues=maintenance_issues,
        vacancy_rate=0.1,
        location_score=75,
        market_value=200000,
        insurance_claims=0
    )
    
    recommendations = risk_engine.get_risk_recommendations(score, level)
    
    assessment = RiskAssessment(
        property_id=property_id,
        risk_score=score,
        risk_level=level,
        factors=json.dumps(factors),
        recommendation=json.dumps(recommendations)
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    
    return {
        "tenant_id": None,
        "property_id": property_id,
        "risk_score": score,
        "risk_level": level,
        "factors": factors,
        "recommendation": recommendations,
        "created_at": assessment.created_at
    }


# ==================== ANALYTICS ENDPOINTS ====================

@app.get("/api/analytics/dashboard", response_model=AnalyticsResponse)
def get_analytics_dashboard(db: Session = Depends(get_db)):
    """Get comprehensive analytics dashboard"""
    total_properties = db.query(Property).count()
    total_tenants = db.query(Tenant).filter(Tenant.is_active == True).count()
    
    # Calculate revenue
    completed_transactions = db.query(Transaction).filter(
        Transaction.status == "completed"
    ).all()
    total_revenue = sum(t.amount for t in completed_transactions)
    
    # Calculate occupancy rate
    occupied_properties = db.query(Tenant).filter(Tenant.is_active == True).count()
    occupancy_rate = (occupied_properties / total_properties * 100) if total_properties > 0 else 0
    
    # Get average risks
    risk_assessments = db.query(RiskAssessment).all()
    avg_property_risk = sum(r.risk_score for r in risk_assessments if r.property_id) / len([r for r in risk_assessments if r.property_id]) if [r for r in risk_assessments if r.property_id] else 50
    avg_tenant_risk = sum(r.risk_score for r in risk_assessments if r.tenant_id) / len([r for r in risk_assessments if r.tenant_id]) if [r for r in risk_assessments if r.tenant_id] else 50
    
    maintenance_count = db.query(MaintenanceRequest).count()
    pending_transactions = db.query(Transaction).filter(Transaction.status == "pending").count()
    
    return AnalyticsResponse(
        total_properties=total_properties,
        total_tenants=total_tenants,
        total_revenue=total_revenue,
        occupancy_rate=occupancy_rate,
        average_property_risk=avg_property_risk,
        average_tenant_risk=avg_tenant_risk,
        maintenance_requests=maintenance_count,
        pending_transactions=pending_transactions
    )


@app.get("/api/analytics/portfolio", response_model=PortfolioStatsResponse)
def get_portfolio_stats(db: Session = Depends(get_db)):
    """Get portfolio statistics"""
    properties = db.query(Property).all()
    tenants = db.query(Tenant).all()
    
    risk_engine = get_risk_engine()
    
    properties_data = [{"risk_score": 60} for p in properties]  # Simplified
    tenants_data = [{"risk_score": 70, "is_active": t.is_active} for t in tenants]
    
    stats = risk_engine.calculate_portfolio_risk(properties_data, tenants_data)
    return stats


@app.get("/api/analytics/property/{property_id}")
def get_property_analytics(property_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific property"""
    property = db.query(Property).filter(Property.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    tenants = db.query(Tenant).filter(Tenant.property_id == property_id).all()
    transactions = db.query(Transaction).filter(Transaction.property_id == property_id).all()
    maintenance = db.query(MaintenanceRequest).filter(
        MaintenanceRequest.property_id == property_id
    ).all()
    
    return {
        "property_id": property_id,
        "address": property.address,
        "total_tenants": len(tenants),
        "active_tenants": len([t for t in tenants if t.is_active]),
        "total_transactions": len(transactions),
        "total_revenue": sum(t.amount for t in transactions if t.status == "completed"),
        "maintenance_issues": len(maintenance),
        "pending_maintenance": len([m for m in maintenance if m.status == "open"])
    }


# ==================== Health Check ====================

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "RentWise API", "version": "2.0.0"}


@app.get("/")
def root():
    """Root endpoint with API info"""
    return {
        "service": "RentWise - Advanced Rental Property Management",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
