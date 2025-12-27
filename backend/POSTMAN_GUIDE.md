# 📮 Postman Setup - Step by Step

## Method 1: Import from File

### Step 1: Open Postman
![Open Postman](https://via.placeholder.com/800x100/4CAF50/FFFFFF?text=Open+Postman+Desktop+App)

### Step 2: Click Import Button
- Location: Top left corner
- Button says "Import"

```
┌─────────────────────────────────────┐
│  Import  New ▼  Runner  Mock  ...  │
│   ↑                                 │
│ Click Here                          │
└─────────────────────────────────────┘
```

### Step 3: Select File
- Click "File" tab
- Click "Upload Files"
- Navigate to: `backend/POS-API-Postman.json`
- Click "Open"

### Step 4: Confirm Import
- You'll see preview: "POS System API" collection
- Click "Import" button

---

## Method 2: Copy-Paste JSON

1. Open the file `backend/POS-API-Postman.json` in any text editor
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. In Postman, click "Import"
4. Click "Raw text" tab
5. Paste the JSON content
6. Click "Import"

---

## Setting Up Environment

### Create Environment
```
1. Click "Environments" (left sidebar, looks like ⚙️)
2. Click "+ Create Environment"
3. Name: "POS Local"
4. Add these variables:
   ┌─────────────┬─────────────────────────────┐
   │ Variable    │ Initial Value               │
   ├─────────────┼─────────────────────────────┤
   │ baseUrl     │ http://localhost:3001       │
   │ token       │ (leave empty for now)       │
   └─────────────┴─────────────────────────────┘
5. Click "Save"
6. Select "POS Local" from dropdown (top right)
```

---

## Testing Workflow

### 🔑 Step 1: Login (REQUIRED FIRST!)

**Request:**
```
POST {{baseUrl}}/api/auth/login
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "675a...",
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important:** Copy the `token` value from response!

---

### 📝 Step 2: Save Token to Environment

**Option A - Manual:**
1. Copy the token from login response
2. Go to Environments → POS Local
3. Paste token into `token` variable Current Value
4. Click Save

**Option B - Automatic (Recommended):**
Add this script to Login request's "Tests" tab:
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    console.log("✅ Token saved automatically!");
});
```

---

### 📦 Step 3: Test Protected Endpoints

All other endpoints need the token. Postman will auto-insert it if you use:

**Headers:**
```
Authorization: Bearer {{token}}
```

**Example - Get Products:**
```
GET {{baseUrl}}/api/products
Headers:
  Authorization: Bearer {{token}}
```

---

## Quick Reference - All Endpoints

### ✅ No Authentication Required
```
POST /api/auth/login
```

### 🔒 Authentication Required (All roles)
```
GET  /api/auth/me
POST /api/auth/logout
GET  /api/products
GET  /api/products/:id
POST /api/sales
GET  /api/sales/:id
GET  /api/sales (with date filter)
GET  /api/sales/reports/daily
GET  /api/sales/reports/top-products
```

### 👑 Admin Only
```
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/stock/adjust
POST   /api/stock/purchases
GET    /api/stock/low-stock
GET    /api/stock/expiring
GET    /api/stock/out-of-stock
GET    /api/stock/value
```

---

## Testing Checklist

- [ ] Import Postman collection
- [ ] Create environment with baseUrl
- [ ] Test login endpoint with your credentials
- [ ] Save token to environment
- [ ] Test GET /api/products
- [ ] Test GET /api/products with search: `?search=coca`
- [ ] Get a product ID from products list
- [ ] Test POST /api/sales (create a sale)
- [ ] Test GET /api/sales/reports/daily
- [ ] Test cashier permissions (can't create products) using a cashier account you created

---

## Common Errors & Fixes

### ❌ Error: "Authorization token missing"
**Fix:** 
- Make sure token is saved in environment
- Check Authorization header is set to `Bearer {{token}}`

### ❌ Error: "Invalid token" or "jwt malformed"
**Fix:**
- Login again to get fresh token
- Token expires after some time

### ❌ Error: "Access denied"
**Fix:**
- Check user role (cashier can't access admin endpoints)
- Login as admin for admin-only endpoints

### ❌ Error: "Product not found"
**Fix:**
- Use correct MongoDB ObjectId format
- Get ID from GET /api/products response

---

## PowerShell Alternative (No Postman Needed)

If you don't have Postman, use PowerShell:

```powershell
# 1. Login
$body = '{"username":"<your-username>","password":"<your-password>"}'
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST -Body $body -ContentType "application/json"
$token = $response.token

# 2. Get Products
$headers = @{ "Authorization" = "Bearer $token" }
$products = Invoke-RestMethod -Uri "http://localhost:3001/api/products" `
  -Method GET -Headers $headers
$products | Format-Table

# 3. Create Sale (replace PRODUCT_ID with actual ID)
$saleBody = '{"items":[{"product_id":"PRODUCT_ID","quantity":2}],"discount":0,"payment_method":"cash","cash_received":100}'
$sale = Invoke-RestMethod -Uri "http://localhost:3001/api/sales" `
  -Method POST -Body $saleBody -Headers (@{ 
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  })
$sale
```

---

## 🎯 Success Indicators

✅ Collection imported: See "POS System API" in left sidebar
✅ Environment created: See "POS Local" in top-right dropdown  
✅ Login working: Status 200, get token in response
✅ Token saved: See token value in environment variables
✅ Products working: Status 200, get array of products
✅ Sales working: Status 201, sale created successfully

---

**Need help?** Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specs!
