# POS System Backend API Documentation

## Overview
RESTful API for Point of Sale System with authentication, product management, sales processing, and inventory control.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All endpoints (except `/auth/login`) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### 1. Login
**POST** `/auth/login`

Request body:
```json
{
  "username": "admin",
  "password": "admin"
}
```

Response:
```json
{
  "user": {
    "id": "user-id",
    "username": "admin",
    "role": "admin"
  },
  "token": "jwt-token-here"
}
```

### 2. Get Current User
**GET** `/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "id": "user-id",
  "username": "admin",
  "role": "admin"
}
```

### 3. Logout
**POST** `/auth/logout`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

---

## Product Endpoints

### 1. Get All Products
**GET** `/products?search=<query>&category=<category>`

Query Parameters:
- `search` (optional): Search by name or barcode
- `category` (optional): Filter by category

Response:
```json
[
  {
    "id": "product-id",
    "name": "Coca Cola 330ml",
    "barcode": "8851234567890",
    "category": "Beverages",
    "cost_price": 30,
    "selling_price": 50,
    "stock_quantity": 100,
    "description": "...",
    "created_at": "2025-12-12T..."
  }
]
```

### 2. Get Product By ID
**GET** `/products/:id`

Response: Single product object

### 3. Create Product (Admin Only)
**POST** `/products`

Request body:
```json
{
  "name": "New Product",
  "barcode": "unique-barcode",
  "category": "Category Name",
  "cost_price": 100,
  "selling_price": 150,
  "stock_quantity": 50,
  "description": "Product description"
}
```

### 4. Update Product (Admin Only)
**PUT** `/products/:id`

Request body: (any field to update)
```json
{
  "selling_price": 175
}
```

### 5. Delete Product (Admin Only)
**DELETE** `/products/:id`

### 6. Get Low Stock Products
**GET** `/products/low-stock?threshold=10`

### 7. Get Expiring Products
**GET** `/products/expiring?days=30`

---

## Sales Endpoints

### 1. Create Sale (Checkout)
**POST** `/sales`

Request body:
```json
{
  "items": [
    {
      "product_id": "product-id",
      "quantity": 5
    }
  ],
  "discount": 100,
  "payment_method": "cash",
  "cash_received": 1500
}
```

Response:
```json
{
  "id": "sale-id",
  "bill_number": "INV-1702429874000",
  "items": [...],
  "subtotal": 250,
  "discount": 100,
  "tax": 0,
  "total": 150,
  "payment_method": "cash",
  "change": 1350
}
```

**Features:**
- Validates stock availability
- Atomically decrements stock
- Calculates change
- Supports cash, card, QR payment methods

### 2. Get Sale By ID
**GET** `/sales/:id`

Response: Complete sale with items

### 3. Get Sales By Date
**GET** `/sales?start_date=2025-12-01&end_date=2025-12-31`

Query Parameters:
- `start_date` (required): YYYY-MM-DD format
- `end_date` (optional): Defaults to today

### 4. Get Daily Sales Report (Admin Only)
**GET** `/sales/reports/daily?date=2025-12-12`

Response:
```json
{
  "total_bills": 45,
  "total_sales": 12450,
  "cash_sales": 8000,
  "card_sales": 3450,
  "qr_sales": 1000,
  "average_bill": 276.67,
  "min_bill": 50,
  "max_bill": 1200
}
```

### 5. Get Top Products Report (Admin Only)
**GET** `/sales/reports/top-products?limit=5&days=30`

Query Parameters:
- `limit` (optional): Number of products. Default: 5
- `days` (optional): Number of days back. Default: 30

Response:
```json
[
  {
    "id": "product-id",
    "name": "Coca Cola 330ml",
    "barcode": "8851234567890",
    "units_sold": 145,
    "total_revenue": 7250,
    "avg_price": 50
  }
]
```

---

## Stock/Inventory Endpoints

### 1. Adjust Stock (Admin Only)
**POST** `/stock/adjust`

Request body:
```json
{
  "product_id": "product-id",
  "quantity": 10,
  "reason": "restock|damage|expired|manual_adjust"
}
```

Response:
```json
{
  "id": "adjustment-id",
  "product_id": "product-id",
  "quantity_change": 10,
  "new_stock": 110,
  "reason": "restock"
}
```

### 2. Record Purchase (Admin Only)
**POST** `/stock/purchases`

Request body:
```json
{
  "supplier_name": "Supplier Name",
  "items": [
    {
      "product_id": "product-id",
      "quantity": 50,
      "cost_price": 25
    }
  ]
}
```

Response:
```json
{
  "id": "purchase-id",
  "supplier_name": "Supplier Name",
  "total_amount": 1250,
  "items_count": 1
}
```

**Features:**
- Updates product cost price
- Automatically increments stock
- Logs audit trail

### 3. Get Low Stock Products
**GET** `/stock/low-stock?threshold=10`

### 4. Get Expiring Products
**GET** `/stock/expiring?days=30`

### 5. Get Out of Stock Products
**GET** `/stock/out-of-stock`

### 6. Get Stock Value (Admin Only)
**GET** `/stock/value`

Response:
```json
{
  "total_value": 245890,
  "retail_value": 450000,
  "total_products": 8,
  "out_of_stock_count": 0
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Business Logic & Validations

### Sales Validation
- ✅ Stock availability check before sale
- ✅ Atomic transaction for stock decrement
- ✅ Prevent negative stock
- ✅ Rounding to 2 decimal places
- ✅ Change calculation for cash payments

### Stock Management
- ✅ Prevent negative stock adjustments
- ✅ Expiry date tracking
- ✅ Low stock alerts
- ✅ Audit trail for all adjustments
- ✅ Cost price updates on purchases

### Authentication
- ✅ Password hashing with bcrypt
- ✅ JWT token generation (7-day expiry)
- ✅ Role-based access control (Admin/Cashier)

---

## Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Test Files
- `tests/services/AuthService.test.js`
- `tests/services/ProductService.test.js`
- `tests/services/SalesService.test.js`

### Test Coverage
- Authentication: Login, token verification
- Products: CRUD, search, filters
- Sales: Transaction integrity, stock validation
- Stock: Adjustments, purchases, reports

---

## Quick Start

1. Start backend:
```bash
npm run dev
```

2. Create or ensure a user exists (admin/cashier) in your MongoDB database.

3. Login with your real credentials:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<your-username>","password":"<your-password>"}'
```

4. Use token in subsequent requests:
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/products
```

---

## Environment Variables

See `.env.sample`:
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DB_PATH=./src/data/pos.db
LOG_LEVEL=debug
```

---

## Database Schema

- `users`: User accounts (id, username, password, role)
- `products`: Product catalog (id, name, barcode, prices, stock)
- `sales`: Sales invoices (id, bill_number, total, payment_method)
- `sales_items`: Line items (id, sale_id, product_id, quantity, price)
- `stock_adjustments`: Audit log (id, product_id, quantity_change, reason)
- `purchases`: Purchase orders (id, supplier_name, items, total)
- `purchase_items`: Purchase line items

---

Generated: 2025-12-12
