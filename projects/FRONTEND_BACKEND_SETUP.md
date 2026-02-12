# RentWise Frontend-Backend Integration Guide

## ✅ Current Status

### Backend Server
- **Status**: Running on port 8000
- **Framework**: FastAPI with Uvicorn
- **Database**: SQLite (auto-created: `rentwise.db`)
- **API Base URL**: `http://localhost:8000/api`
- **Docs URL**: `http://localhost:8000/docs`

### Frontend Server
- **Status**: Running on port 3000
- **Framework**: React 19.2.4 with React Router
- **Development Server**: Webpack/Create React App

---

## 🔌 Connectivity Configuration

### Environment Variables
The frontend is configured via `.env` file:
```
REACT_APP_API_URL=http://localhost:8000/api
```

### API Client Configuration
All API requests go through **`website/src/services/api.js`** which includes:
- ✅ Axios HTTP client with default configuration
- ✅ Request/Response interceptors for debugging
- ✅ Error handling with detailed logging
- ✅ 10-second request timeout
- ✅ Base URL from environment variable
- ✅ Health check function

### Endpoints Available

#### Properties
```
GET    /api/properties              - List all properties
GET    /api/properties/{id}         - Get property details
POST   /api/properties              - Create new property
PUT    /api/properties/{id}         - Update property
DELETE /api/properties/{id}         - Delete property
```

#### Tenants
```
GET    /api/tenants                 - List all tenants
GET    /api/tenants/{id}            - Get tenant details
POST   /api/tenants                 - Create new tenant
PUT    /api/tenants/{id}            - Update tenant
GET    /api/properties/{id}/tenants - Get tenants for property
```

#### Transactions
```
GET    /api/transactions            - List transactions
GET    /api/tenants/{id}/transactions - Get tenant transactions
POST   /api/transactions            - Create transaction
PUT    /api/transactions/{id}/confirm - Confirm with blockchain hash
```

#### Maintenance
```
GET    /api/maintenance             - List maintenance requests
POST   /api/maintenance             - Create request
PUT    /api/maintenance/{id}/status - Update status
```

#### Risk Assessment
```
POST   /api/risk/assess-tenant      - Assess tenant risk
POST   /api/risk/assess-property    - Assess property risk
GET    /api/risk/portfolio          - Get portfolio risk stats
```

#### Analytics
```
GET    /api/analytics/dashboard     - Dashboard stats & KPIs
GET    /api/analytics/portfolio     - Portfolio analytics
GET    /api/analytics/property/{id} - Property-specific analytics
```

#### Health Check
```
GET    /api/health                  - Backend health status
```

---

## 📱 Mobile Responsiveness

### Implemented Breakpoints
- **480px**: Mobile portrait (extra-small screens)
- **768px**: Mobile landscape (small tablets)
- **1024px**: Tablet portrait (medium screens)
- **1440px+**: Desktop (large screens)

### Mobile-Optimized Features
✅ Responsive grid layout (auto-adjusts from 4 → 3 → 2 → 1 columns)
✅ Hamburger menu for navigation
✅ Optimized touch targets (44px minimum)
✅ Mobile-friendly forms
✅ Responsive tables with horizontal scroll
✅ Stacked layouts on mobile

---

## 📄 Pages & Features

### Dashboard
- 8 KPI cards with real-time data from backend
- Portfolio summary statistics
- Property occupancy overview
- Recent transactions

### Properties
- Full CRUD operations
- Add/Edit property form
- Monthly rent tracking
- Property status management
- Mobile-responsive property list

### Tenants (Enhanced)
- Complete tenant management
- Add new tenants with property association
- Tenant credit scores and reputation badges
- Risk assessment button (calls backend AI engine)
- Modal details view on tenant click
- Real-time status indicators
- Better error handling with retry functionality

### Transactions
- Transaction history with blockchain integration
- Tenant association
- Payment status tracking
- Blockchain hash verification
- Transaction details

### Risk Analysis
- Individual tenant/property risk assessment
- Portfolio-wide risk metrics
- Detailed risk factor breakdown
- Recommendations based on risk level
- Real-time calculations using AI engine

### Maintenance
- Maintenance request workflow
- Status tracking (pending, in-progress, completed)
- Property association
- Maintenance history
- Status update notifications

---

## 🧪 Testing Frontend-Backend Connectivity

### Browser Console Testing
Open browser DevTools (F12) and check the Console tab:

1. **See API Requests**: All API calls are logged with 📤/✅ indicators
2. **Check Errors**: Failed requests show with ❌ and error details
3. **Monitor Responses**: Success responses show with ✅ and data preview

### Expected Console Output
```
🔌 API Base URL: http://localhost:8000/api
📤 API Request: GET /tenants
✅ API Response: 200 {tenants: Array(0)}
📤 API Request: GET /properties
✅ API Response: 200 {properties: Array(0)}
```

### Test API Directly
Access Swagger UI documentation:
```
http://localhost:8000/docs
```

Here you can:
- Browse all available endpoints
- See request/response schemas
- Test endpoints with the "Try it out" button
- View example responses

---

## 🚀 Starting Servers

### Backend (Terminal 1)
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

### Frontend (Terminal 2)
```bash
cd website
npm start
# Server runs on http://localhost:3000
```

---

## 🔍 Debugging Checklist

If you experience connectivity issues:

- [ ] Both terminals show "running" status
- [ ] Backend shows `Uvicorn running on...`
- [ ] Frontend shows `webpack compiled successfully`
- [ ] Browser console shows `✅ API Response` messages
- [ ] No red error messages in console
- [ ] `.env` file exists in website folder with correct URL
- [ ] Firewall not blocking localhost:8000 or 3000

### Restart if Needed
```bash
# Kill existing processes and restart
# Backend: Ctrl+C then: python main.py
# Frontend: Ctrl+C then: npm start
```

---

## 📊 Data Models

### Property
```json
{
  "id": 1,
  "address": "123 Main St",
  "monthly_rent": 2000,
  "bedrooms": 2,
  "condition": "excellent",
  "is_verified": true,
  "created_at": "2024-01-15T10:00:00"
}
```

### Tenant
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "property_id": 1,
  "wallet_address": "0x742d35Cc...",
  "credit_score": 750,
  "reputation_score": 85.5,
  "is_active": true,
  "move_in_date": "2024-01-20T00:00:00"
}
```

### Risk Assessment
```json
{
  "risk_score": 35.2,
  "risk_level": "LOW",
  "factors": {
    "payment_history": 90,
    "credit_score": 85,
    "eviction_history": 0
  },
  "recommendation": ["Continue with current terms"]
}
```

---

## 🎯 Next Steps

1. **Test Manually**:
   - Visit `http://localhost:3000`
   - Click through all pages
   - Try adding properties and tenants
   - Run risk assessments

2. **Monitor Console**:
   - Press F12 in browser
   - Watch API requests/responses
   - Check for any error messages

3. **Try on Mobile**:
   - Get your computer's IP: `ipconfig` (look for IPv4)
   - Visit `http://<YOUR_IP>:3000` from mobile device
   - Test responsive features

4. **Deploy When Ready**:
   - Backend can be deployed to cloud (Heroku, Render, etc.)
   - Frontend can be built: `npm run build`
   - Deploy build folder to hosting (Vercel, Netlify, etc.)

---

## 🚨 Common Issues & Solutions

### "API requests failing"
- Check backend is running on 8000
- Check `.env` has correct URL
- Check browser console for detailed errors

### "Mobile menu not working"
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check if CSS loaded properly

### "Database appears empty"
- Delete `backend/rentwise.db` to reset
- Restart backend - it will recreate DB
- Add data through API

### "Port 8000/3000 already in use"
- Find process: `netstat -ano | findstr :8000`
- Kill process: `taskkill /pid <PID> /f`
- Restart server

---

## 📝 Notes

- Database auto-migrates on backend startup
- CORS is enabled for all origins during development
- All API responses include detailed error messages
- Request timeout is 10 seconds
- Environment variables must be set before `npm start`

