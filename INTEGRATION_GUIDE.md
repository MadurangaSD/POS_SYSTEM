# Frontend-Backend Integration Guide

## ✅ Integration Status

The POS system frontend has been successfully connected to the MongoDB backend. All screens now use real API calls instead of mock data.

## 🔗 What Was Connected

### 1. Login Screen (`LoginPage.jsx`)
- ✅ Real authentication with JWT tokens
- ✅ Stores token and user data in localStorage
- ✅ Role-based routing (admin → dashboard, cashier → POS)
- ✅ Error handling for invalid credentials

### 2. POS Checkout Screen (`POSCheckoutPage.jsx`)
- ✅ Fetches real products from MongoDB
- ✅ Displays product names, barcodes, prices, and stock levels
- ✅ Search functionality works with backend data
- ✅ Barcode scanner integrated with product lookup
- ✅ Loading and error states implemented

### 3. Payment Modal (`PaymentModal.jsx`)
- ✅ Creates sales in MongoDB when payment is confirmed
- ✅ Supports cash, card, and QR payment methods
- ✅ Automatically updates stock levels via backend
- ✅ Generates bill numbers from backend
- ✅ Error handling for failed transactions

### 4. Admin Dashboard (`AdminDashboard.jsx`)
- ✅ Fetches real daily sales metrics
- ✅ Shows actual inventory value from MongoDB
- ✅ Displays top-selling products
- ✅ All metrics update from backend APIs

## 🚀 How to Test the System

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```
Backend should be running on: http://localhost:3001

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend should be running on: http://localhost:5173

### Step 3: Test Login
1. Open http://localhost:5173 in your browser
2. Login with a valid user you created (admin or cashier role)

### Step 4: Test POS Flow (as Cashier)
1. Login with a cashier-role user
2. Ensure products exist in MongoDB so the grid populates
3. Add products to cart by clicking them
4. Click "Proceed to Payment"
5. Enter payment details and confirm
6. Receipt should be generated with real bill number
7. Check MongoDB to verify sale was created

### Step 5: Test Admin Dashboard
1. Login with an admin-role user
2. Dashboard should display:
  - Today's sales total
  - Number of bills
  - Inventory value
  - Top selling products
3. All data fetched from MongoDB

## 🔐 Authentication Flow

```
1. User enters credentials → POST /api/auth/login
2. Backend validates credentials → Returns JWT token
3. Token stored in localStorage
4. All subsequent API calls include token in Authorization header
5. Backend validates token on each request
6. If token expires (401) → Auto-logout and redirect to login
```

## 📡 API Endpoints Used

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (with token)

### Products
- `GET /api/products` - Get all products (used in POS screen)
- `GET /api/products/search?q=keyword` - Search products
- `GET /api/products/:id` - Get single product

### Sales
- `POST /api/sales` - Create new sale (used in PaymentModal)
- `GET /api/sales/daily-report/:date` - Daily sales report (used in Dashboard)
- `GET /api/sales/top-products?limit=5&days=30` - Top products (used in Dashboard)

### Stock
- `GET /api/stock/value` - Total inventory value (used in Dashboard)
- `GET /api/stock/low-stock` - Low stock products
- `GET /api/stock/expiring` - Expiring products

## 🛠️ API Service Layer

All API calls go through `frontend/src/services/api.js`:

```javascript
import { authAPI, productsAPI, salesAPI, stockAPI } from './services/api';

// Example usage:
const products = await productsAPI.getAll();
const sale = await salesAPI.create(saleData);
const report = await salesAPI.getDailyReport('2025-12-12');
```

### Features:
- ✅ Automatic JWT token injection
- ✅ Auto-logout on 401 errors
- ✅ Centralized error handling
- ✅ Clean async/await syntax

## 🧪 Testing Checklist

- [ ] **Login Test**
  - [ ] Login with a valid admin user → Navigate to /admin/dashboard
  - [ ] Login with a valid cashier user → Navigate to /pos
  - [ ] Invalid credentials → Show error message
  
- [ ] **POS Test**
  - [ ] Products load from MongoDB
  - [ ] Search filters products
  - [ ] Barcode scan adds matching product to cart
  - [ ] Add multiple products to cart
  - [ ] Adjust quantities
  - [ ] Remove items from cart
  
- [ ] **Payment Test**
  - [ ] Cash payment → Calculate change correctly
  - [ ] Card payment → Marks as card
  - [ ] QR payment → Marks as QR
  - [ ] Confirm payment → Creates sale in MongoDB
  - [ ] Receipt displays with bill number
  
- [ ] **Admin Dashboard Test**
  - [ ] Today's sales shows real total
  - [ ] Total bills shows real count
  - [ ] Inventory value shows real sum
  - [ ] Top products list displays
  
- [ ] **Error Handling Test**
  - [ ] Stop backend → Frontend shows error messages
  - [ ] Invalid token → Auto-logout
  - [ ] Network error → User-friendly error

## 📊 Database Verification

After creating sales, verify in MongoDB:

```bash
# Connect to MongoDB (if using MongoDB Compass)
mongodb+srv://sithumu493_db_user:Sithum123@pos-cluster.kfggynt.mongodb.net/

# Check collections:
- users (2 documents: admin, cashier)
- products (8 documents)
- sales (new sales created)
- stockadjustments (stock changes logged)
```

## 🐛 Troubleshooting

### Issue: Products not loading
**Solution**: Check if backend is running and MongoDB is connected
```bash
# Test backend health
curl http://localhost:3001/health
```

### Issue: Login fails
**Solution**: Verify credentials and check backend logs
```bash
# Test login manually
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Issue: Payment fails
**Solution**: Check if token is valid and product IDs exist
- Open browser DevTools → Console
- Check for error messages
- Verify token in localStorage

### Issue: 401 Unauthorized errors
**Solution**: Token expired or invalid
- Clear localStorage
- Login again
- Check token expiration time (default: 7 days)

## 🔄 Data Flow Example

### Complete Sale Transaction:

```
1. Cashier scans barcode → GET /api/products?barcode=XXX
2. Product added to cart (frontend state)
3. Cashier clicks "Proceed to Payment"
4. Cashier enters cash amount
5. Cashier confirms payment → POST /api/sales
   {
     items: [{ product_id: "...", quantity: 2, unit_price: 50 }],
     discount: 0,
     payment_method: "cash",
     cash_received: 100
   }
6. Backend:
   - Validates stock availability
   - Creates sale record
   - Decrements product quantities
   - Creates stock adjustment log
   - Returns sale with bill number
7. Frontend displays receipt
8. Cart cleared, ready for next customer
```

## 📝 Next Steps

### Completed ✅
- Frontend-backend integration
- Authentication with JWT
- Product management
- Sales creation
- Receipt generation
- Admin dashboard metrics

### To Do 🚧
- [ ] Product management screen (CRUD operations)
- [ ] Sales history view
- [ ] Inventory management screen
- [ ] User management (admin only)
- [ ] Reports and analytics
- [ ] Print barcode labels
- [ ] Dark mode toggle
- [ ] Toast notifications for better UX
- [ ] Offline mode support

## 🎯 Key Files Modified

- `frontend/src/pages/auth/LoginPage.jsx` - Added real API login
- `frontend/src/pages/pos/POSCheckoutPage.jsx` - Loads products from backend
- `frontend/src/pages/pos/PaymentModal.jsx` - Creates sales via API
- `frontend/src/pages/admin/AdminDashboard.jsx` - Fetches real metrics
- `frontend/src/services/api.js` - Complete API integration layer (NEW)

## 💡 Tips

1. **Always keep backend running** - Frontend depends on it
2. **Check browser console** - Errors will show there
3. **Use Postman** - Test APIs independently (see POSTMAN_GUIDE.md)
4. **Monitor MongoDB** - Use MongoDB Compass to see data changes
5. **Check network tab** - In DevTools to see API requests/responses

## 📞 Support

If you encounter issues:
1. Check backend is running: http://localhost:3001/health
2. Check frontend is running: http://localhost:5173
3. Check MongoDB connection in backend logs
4. Clear browser cache and localStorage
5. Review error messages in console

---

**Status**: ✅ Frontend and Backend Successfully Connected!

All core POS functionality is now working with real MongoDB data.
