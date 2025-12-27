# 🧪 API Testing Guide - POS System Backend

## ✅ Backend Status
- **URL**: http://localhost:3001
- **Database**: MongoDB Atlas (Connected)
- **Status**: ✅ Running

## 🔐 Authentication
Use real credentials created in your environment (admin or cashier roles). Ensure users exist in MongoDB before testing.

---

## 📮 Using Postman Collection

### Step 1: Import Postman Collection
1. Open **Postman** application
2. Click **Import** button (top left)
3. Select **File** tab
4. Browse to: `backend/POS-API-Postman.json`
5. Click **Import**

### Step 2: Set Environment Variable
After importing, you'll have a collection called "POS System API"

**Create an environment:**
1. Click **Environments** (left sidebar)
2. Click **+ Create Environment**
3. Name it: `POS Local`
4. Add variable:
   - **Variable**: `baseUrl`
   - **Initial Value**: `http://localhost:3001`
   - **Current Value**: `http://localhost:3001`
5. Add variable:
   - **Variable**: `token`
   - **Initial Value**: (leave empty)
   - **Current Value**: (leave empty)
6. Click **Save**
7. Select "POS Local" from environment dropdown (top right)

### Step 3: Test Endpoints in Order

#### 1️⃣ **Login First** (Required!)
```
POST {{baseUrl}}/api/auth/login

Body (JSON):
{
  "username": "<your-username>",
  "password": "<your-password>"
}
```
✅ After successful login, **copy the token** from response and paste it into your environment variable `token`

OR use this **Test Script** (in Postman Tests tab) to auto-save token:
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

#### 2️⃣ **Get All Products**
```
GET {{baseUrl}}/api/products
Headers:
  Authorization: Bearer {{token}}
```

#### 3️⃣ **Create a Sale**
```
POST {{baseUrl}}/api/sales
Headers:
  Authorization: Bearer {{token}}

Body (JSON):
{
  "items": [
    {
      "product_id": "PASTE_PRODUCT_ID_HERE",
      "quantity": 2
    }
  ],
  "discount": 0,
  "payment_method": "cash",
  "cash_received": 100
}
```
⚠️ Replace `PASTE_PRODUCT_ID_HERE` with actual product ID from Step 2

#### 4️⃣ **Get Daily Sales Report**
```
GET {{baseUrl}}/api/sales/reports/daily?date=2025-12-12
Headers:
  Authorization: Bearer {{token}}
```

---

## 🧪 Quick PowerShell Testing

### Test Login
```powershell
$body = '{"username":"admin","password":"admin"}'
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST -Body $body -ContentType "application/json"
$token = $response.token
Write-Host "Token: $token"
```

### Test Get Products
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
$products = Invoke-RestMethod -Uri "http://localhost:3001/api/products" `
  -Method GET -Headers $headers
$products | Select-Object name, barcode, sellingPrice | Format-Table
```

### Test Create Sale
```powershell
$saleBody = @{
  items = @(
    @{
      product_id = "PRODUCT_ID_HERE"
      quantity = 2
    }
  )
  discount = 0
  payment_method = "cash"
  cash_received = 100
} | ConvertTo-Json -Depth 10

$headers = @{ 
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

$sale = Invoke-RestMethod -Uri "http://localhost:3001/api/sales" `
  -Method POST -Body $saleBody -Headers $headers
$sale
```

---

## 📚 All Available Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Products (Admin only: Create/Update/Delete)
- `GET /api/products` - Get all products (search, filter)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/expiring` - Get expiring products

### Sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/:id` - Get sale by ID
- `GET /api/sales` - Get sales by date range
- `GET /api/sales/reports/daily` - Daily sales report
- `GET /api/sales/reports/top-products` - Top selling products

### Stock (Admin only)
- `POST /api/stock/adjust` - Adjust stock quantity
- `POST /api/stock/purchases` - Record purchase order
- `GET /api/stock/low-stock` - Low stock report
- `GET /api/stock/expiring` - Expiring products report
- `GET /api/stock/out-of-stock` - Out of stock products
- `GET /api/stock/value` - Total inventory value

---

## 🎯 Common Issues & Solutions

### Issue: "Authorization token missing"
**Solution**: Make sure to include Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Issue: "Invalid credentials"
**Solution**: Verify you are using valid credentials for a user that exists in your database (admin or cashier role).

### Issue: "Product not found"
**Solution**: Get product list first using GET /api/products and use the `_id` field

### Issue: "Insufficient stock"
**Solution**: Check product quantity before creating sale

---

## 📊 Test Results

✅ **Login Endpoint** - WORKING
- URL: http://localhost:3001/api/auth/login
- Status: 200 OK
- Returns: user object + JWT token

✅ **Products Endpoint** - WORKING
- URL: http://localhost:3001/api/products
- Status: 200 OK
- Returns: Array of products (depends on your data)

✅ **Database** - CONNECTED
- MongoDB Atlas cluster
- No demo data is seeded automatically; create your own users and products

---

## 🚀 Next Steps

1. ✅ Import Postman collection
2. ✅ Login and save token
3. ✅ Test all endpoints
4. 🔄 Connect React frontend to backend
5. 🎨 Build remaining UI screens

---

**Documentation**: See `API_DOCUMENTATION.md` for detailed endpoint specifications
