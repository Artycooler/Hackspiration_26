"""
Add Sample Data for Investor Pitch
Creates realistic properties and tenants across major US cities
"""

import sys
sys.path.insert(0, 'c:\\Users\\SHARVANI\\Desktop\\RentWise_Final_Project\\backend')

from database import SessionLocal, Property, Tenant
from datetime import datetime, timedelta
import random

def add_sample_data():
    db = SessionLocal()
    
    try:
        # Sample Properties
        properties_data = [
            {
                "address": "125 Maple Street, San Francisco, CA 94102",
                "monthly_rent": 3500,
                "bedrooms": 3,
                "bathrooms": 2,
                "square_feet": 1800,
                "property_type": "apartment",
                "status": "rented",
                "deposit_required": 7000
            },
            {
                "address": "456 Oak Avenue, New York, NY 10001",
                "monthly_rent": 4200,
                "bedrooms": 2,
                "bathrooms": 2,
                "square_feet": 1200,
                "property_type": "apartment",
                "status": "rented",
                "deposit_required": 8400
            },
            {
                "address": "789 Pine Road, Austin, TX 78701",
                "monthly_rent": 2800,
                "bedrooms": 3,
                "bathrooms": 2,
                "square_feet": 1600,
                "property_type": "house",
                "status": "rented",
                "deposit_required": 5600
            },
            {
                "address": "321 Cedar Lane, Denver, CO 80202",
                "monthly_rent": 2400,
                "bedrooms": 2,
                "bathrooms": 1,
                "square_feet": 1100,
                "property_type": "condo",
                "status": "rented",
                "deposit_required": 4800
            },
            {
                "address": "654 Elm Street, Boston, MA 02108",
                "monthly_rent": 3100,
                "bedrooms": 2,
                "bathrooms": 2,
                "square_feet": 1350,
                "property_type": "apartment",
                "status": "rented",
                "deposit_required": 6200
            },
            {
                "address": "987 Birch Boulevard, Seattle, WA 98101",
                "monthly_rent": 3000,
                "bedrooms": 3,
                "bathrooms": 2,
                "square_feet": 1700,
                "property_type": "house",
                "status": "rented",
                "deposit_required": 6000
            }
        ]
        
        # Add properties
        print("📍 Adding Properties...")
        property_ids = []
        for prop_data in properties_data:
            prop = Property(**prop_data)
            db.add(prop)
            db.commit()
            # attach 2 sample photos from picsum
            seed = abs(hash(prop.address)) % 1000
            photos = [f"https://picsum.photos/seed/{seed}/800/600", f"https://picsum.photos/seed/{seed+1}/800/600"]
            try:
                prop.photos = photos
                db.commit()
            except Exception:
                db.rollback()

            property_ids.append(prop.id)
            print(f"  ✅ {prop_data['address']} - ${prop_data['monthly_rent']}/month")
        
        print(f"\n✨ Added {len(property_ids)} properties!")
        
        # Sample Tenants
        first_names = ["John", "Sarah", "Michael", "Emma", "David", "Jessica", "James", "Lisa", "Robert", "Jennifer"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]
        
        tenants_data = [
            {"name": "John Smith", "email": "john.smith@email.com", "credit_score": 780, "property_id": property_ids[0]},
            {"name": "Sarah Johnson", "email": "sarah.johnson@email.com", "credit_score": 750, "property_id": property_ids[0]},
            {"name": "Michael Williams", "email": "michael.w@email.com", "credit_score": 820, "property_id": property_ids[1]},
            {"name": "Emma Brown", "email": "emma.brown@email.com", "credit_score": 790, "property_id": property_ids[1]},
            {"name": "David Jones", "email": "david.jones@email.com", "credit_score": 700, "property_id": property_ids[2]},
            {"name": "Jessica Garcia", "email": "jessica.garcia@email.com", "credit_score": 760, "property_id": property_ids[2]},
            {"name": "James Miller", "email": "james.miller@email.com", "credit_score": 810, "property_id": property_ids[3]},
            {"name": "Lisa Davis", "email": "lisa.davis@email.com", "credit_score": 770, "property_id": property_ids[3]},
            {"name": "Robert Rodriguez", "email": "robert.r@email.com", "credit_score": 730, "property_id": property_ids[4]},
            {"name": "Jennifer Martinez", "email": "jen.martinez@email.com", "credit_score": 800, "property_id": property_ids[5]},
        ]
        
        # Add tenants
        print("\n👥 Adding Tenants...")
        for tenant_data in tenants_data:
            tenant = Tenant(
                name=tenant_data["name"],
                email=tenant_data["email"],
                property_id=tenant_data["property_id"],
                wallet_address=f"0x{random.randint(1000000, 9999999):07d}{random.randint(1000000, 9999999):07d}",
                credit_score=tenant_data["credit_score"],
                is_active=True,
                move_in_date=datetime.now() - timedelta(days=random.randint(30, 365))
            )
            db.add(tenant)
            db.commit()
            print(f"  ✅ {tenant_data['name']} ({tenant_data['credit_score']} credit) - {tenant_data['email']}")
        
        print(f"\n✨ Added {len(tenants_data)} tenants!")
        
        # Summary
        print("\n" + "="*60)
        print("📊 SAMPLE DATA ADDED SUCCESSFULLY!")
        print("="*60)
        print(f"\n✅ Total Properties: {len(property_ids)}")
        print(f"✅ Total Tenants: {len(tenants_data)}")
        print(f"✅ Monthly Revenue (Potential): ${sum(p['monthly_rent'] for p in properties_data):,}")
        print(f"✅ Average Tenant Credit Score: {sum(t['credit_score'] for t in tenants_data) // len(tenants_data)}")
        print(f"✅ Occupancy Rate: 100% (All properties occupied)")
        print("\n🎯 Dashboard is now ready for investor pitch!")
        print("📊 Visit http://localhost:3000 to see the metrics")
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
