# 🧪 RentWise Testing & Verification Guide

## ✨ What's Been Enhanced

### 1. Tenants Page Improvements
- ✅ Better error handling with retry button
- ✅ Risk assessment integration (⚠️ Risk button on each tenant)
- ✅ Modal popup for tenant details
- ✅ Improved form with property dropdown showing rent amounts
- ✅ Credit score input with validation (300-850)
- ✅ Status indicators with better styling
- ✅ Empty state message when no tenants

### 2. API Client Enhancements
- ✅ Enhanced logging with emoji indicators (📤 📤 ✅ ❌)
- ✅ Request/Response interceptors
- ✅ Detailed error messages with context
- ✅ Timeout handling (10 seconds)
- ✅ Health check function
- ✅ Better error reporting for network issues
- ✅ Request logging for API operations

### 3. Backend Health Check
- ✅ New `/api/health` endpoint
- ✅ Database connectivity verification
- ✅ Timestamp tracking
- ✅ Detailed status responses

### 4. Bug Fixes
- ✅ Fixed RiskAnalysis.js ESLint dependency warning
- ✅ Improved error handling across all pages
- ✅ Better mobile responsiveness
- ✅ Enhanced form validation

---

## 🚀 Quick Start Testing

### Step 1: Verify Backend is Running (Port 8000)

```bash
# Open new PowerShell and check
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -method GET
$response.Content | ConvertFrom-Json | Format-Table
```

Expected output:
```
status    message                              timestamp                database
------    -------                              ---------                --------
healthy   RentWise Backend is operational      2024-01-15T10:00:00Z     connected
```

### Step 2: Verify Frontend is Running (Port 3000)

```bash
# Check if frontend terminal shows "webpack compiled successfully"
# Visit: http://localhost:3000 in browser
# Should see RentWise dashboard loading
```

### Step 3: Open Browser DevTools & Test

1. **Open DevTools** (F12 in Chrome/Edge)
2. **Go to Console tab**
3. **Navigate to Tenants page** in RentWise app
4. Watch console for API calls:

```
🔌 API Base URL: http://localhost:8000/api
📤 API Request: GET /tenants
✅ API Response: 200
📤 API Request: GET /properties
✅ API Response: 200
```

### Step 4: Test Adding a Tenant

1. Click **"➕ Add Tenant"** button
2. Fill in form:
   - Name: `John Smith`
   - Email: `john@example.com`
   - Wallet: `0x742d35Cc6634C0532925a3b844Bc9e7595f42778`
   - Credit Score: `750`
   - Property: (Select from dropdown)
3. Click **"Save Tenant"**
4. Check console:
   ```
   👤 Creating tenant: {name: "John Smith", email: "john@example.com", ...}
   📤 API Request: POST /tenants
   ✅ API Response: 201 {id: 1, name: "John Smith", ...}
   ```

### Step 5: Test Risk Assessment

1. Click **"⚠️ Risk"** button on any tenant row
2. Console should show:
   ```
   ⚠️ Assessing tenant risk for ID: 1
   📤 API Request: POST /risk/assess-tenant
   ✅ API Response: 200 {risk_score: 35.2, risk_level: "LOW", ...}
   ```
3. Alert popup should show risk score and level

### Step 6: Test Mobile Responsiveness

#### Option A: Browser DevTools Mobile Mode
1. Press F12 (DevTools)
2. Press Ctrl+Shift+M (Toggle Device Toolbar)
3. Select device (iPhone 12, Samsung Galaxy, etc.)
4. Check that layout adapts properly:
   - ✅ Navbar hamburger menu appears
   - ✅ Forms stack vertically
   - ✅ Tables scroll horizontally
   - ✅ Buttons remain clickable

#### Option B: Actual Mobile Device
1. Find computer's IP: Open PowerShell and type `ipconfig`
2. Look for IPv4 address (usually 192.168.x.x)
3. From mobile on same WiFi: Visit `http://YOUR_IP:3000`
4. Test all features on mobile screen

---

## 📊 API Endpoint Testing

### Test Properties Endpoint

```bash
# Create a property
$body = @{
    address = "456 Oak Ave"
    monthly_rent = 1950
    bedrooms = 3
    condition = "great"
    is_verified = $true
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/api/properties" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

$response.Content | ConvertFrom-Json | Format-Table
```

### Test Analytics Endpoint

```bash
# Get dashboard analytics
$response = Invoke-WebRequest -Uri "http://localhost:8000/api/analytics/dashboard" -Method GET
$response.Content | ConvertFrom-Json | Format-Table
```

### View All Available Endpoints

Visit: **`http://localhost:8000/docs`**

This opens Swagger UI where you can:
- See all endpoints
- Try endpoints with "Try it out" button
- See request/response schemas
- Copy cURL commands

---

## ✅ Verification Checklist

### Backend Verification
- [ ] Backend running on port 8000
- [ ] No error messages in backend terminal
- [ ] Health check endpoint returning "healthy"
- [ ] Database created (backend/rentwise.db exists)
- [ ] Swagger docs accessible at `/docs`

### Frontend Verification
- [ ] Frontend running on port 3000
- [ ] "webpack compiled successfully" message
- [ ] No critical errors in console
- [ ] App loads without blank screen
- [ ] Navigation menu visible

### Connectivity
- [ ] API Base URL correct in browser console
- [ ] API requests showing in DevTools Network tab
- [ ] No CORS errors
- [ ] Responses have correct status codes (200, 201, etc.)

### Data Flow
- [ ] Can create properties
- [ ] Can create tenants
- [ ] Tenants appear in table
- [ ] Forms validate inputs
- [ ] Error messages display on failure

### Mobile
- [ ] Hamburger menu appears on mobile
- [ ] Layout adapts to screen size
- [ ] Touch buttons are large enough (44px+)
- [ ] Forms are accessible on mobile
- [ ] Tables scroll horizontally

---

## 🔍 Console Log Interpretation

### ✅ Success Indicators
```
🔌 API Base URL: http://localhost:8000/api     ← Config loaded
📤 API Request: GET /tenants                   ← Request sent
✅ API Response: 200 {data...}                 ← Success!
```

### ❌ Error Indicators
```
❌ Network/Timeout Error: getaddrinfo ENOTFOUND localhost
   → Backend not running on port 8000

❌ API Error 404: Endpoint not found
   → Check API endpoint spelling

❌ Request Error: data validation error
   → Check form input data types
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
1. Check backend terminal shows no errors
2. Try accessing `http://localhost:8000/docs` directly
3. Check port 8000 isn't blocked by firewall
4. Restart backend: `python main.py`

### "Tenants page blank after load"
1. Open DevTools console (F12)
2. Look for API error messages
3. Check if properties exist (go to Properties page first)
4. Verify .env file has correct API URL

### "Mobile menu not responding"
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Check if CSS loaded (right-click → Inspect → check styles)

### "Form submission fails"
1. Check console for validation errors
2. Verify all required fields filled (marked with *)
3. Check DevTools Network tab for API response
4. See error message in alert popup

### "Risk assessment shows error"
1. Ensure at least one tenant exists
2. Check backend is running
3. Look at console for AI engine error messages
4. Verify database is not corrupted

---

## 📈 Performance Testing

### API Response Times
Expected times (normal network):
- GET endpoints: < 100ms
- POST endpoints: < 200ms
- Risk assessment: < 500ms

If slower, backend might be:
- Running on slow computer
- Processing large dataset
- Database being accessed slowly

### Frontend Performance
- Page load: < 2 seconds
- Navigation: < 500ms
- Form submission: < 1 second

---

## 🎯 Next Advanced Testing

### Load Testing
```bash
# Test multiple API calls
for ($i=1; $i -le 10; $i++) {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/tenants" -Method GET
    Write-Host "Request $i: $($response.StatusCode)"
}
```

### Database Testing
```bash
# Verify SQLite database
sqlite3 backend/rentwise.db "SELECT COUNT(*) as tenant_count FROM tenant;"
```

### Blockchain Testing
- Visit Transactions page
- Create a transaction
- Verify blockchain_hash field is populated
- Check transaction confirmation workflow

---

## 📝 Test Report Template

Use this to document your testing:

```
Date: ___________
Tester: __________

Backend Status:
- Running: YES / NO
- Health Check: PASS / FAIL
- Database: OK / ERROR

Frontend Status:
- Running: YES / NO
- Loads: YES / NO
- Console Errors: YES / NO

Connectivity:
- API Requests: YES / NO
- Data Loads: YES / NO
- Forms Work: YES / NO

Mobile:
- Responsive: YES / NO
- Menu Works: YES / NO
- Touch-friendly: YES / NO

Issues Found:
1. ____________________
2. ____________________
3. ____________________

Notes:
_________________________
_________________________
```

---

## 🚀 Ready for Production?

Before deploying, ensure:
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile works on real device
- [ ] API response times acceptable
- [ ] Database connections stable
- [ ] Error handling works
- [ ] Security: Remove debug logs
- [ ] Environment: Use production URLs

