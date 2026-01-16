# Quick Start Guide - Testing New Features

## 🚀 Getting Started

### Start the Backend
```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:3001`

### Start the Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 📝 Step-by-Step Testing

### 1. Create Categories

1. Go to Admin Panel → **Categories** (new menu item)
2. Click **"+ Add Category"**
3. Fill in:
   - **Category Name**: Beverages
   - **Description**: All types of drinks
   - **Tax Rate**: 5%
4. Click **"Save Category"**
5. Repeat for more categories:
   - Snacks (0%)
   - Dairy (0%)
   - Fruits (2%)
   - Vegetables (0%)

**Expected Result**: Categories appear in grid with color-coded cards

---

### 2. Create Brands

1. Go to Admin Panel → **Brands** (new menu item)
2. Click **"+ Add Brand"**
3. Fill in:
   - **Brand Name**: Coca-Cola
   - **Manufacturer**: The Coca-Cola Company
   - **Description**: Global beverage brand
   - **Email**: contact@cocacola.com
   - **Phone**: +1-404-676-2121
   - **Website**: https://www.coca-cola.com
4. Click **"Save Brand"**
5. Repeat for more brands:
   - Pepsi
   - Sprite
   - Fanta

**Expected Result**: Brands appear with contact info, clickable email/website

---

### 3. Create Products with New System

1. Go to Admin Panel → **Products**
2. Click **"+ Add Product"**
3. Fill in:
   - **Product Name**: Coca-Cola Regular
   - **Barcode**: 0001 (base barcode)
   - **Category**: Select "Beverages" (from dropdown - not hardcoded!)
   - **Brand**: Select "Coca-Cola"
   - **Cost Price**: 20
   - **Selling Price**: 40
   - **Quantity**: 100
   - **Reorder Level**: 10
4. Click **"Save Product"**

**Expected Result**: 
- Product created with category name displayed (not ID)
- Brand field populated
- Category shows as "Beverages" in product table

---

### 4. Create Product with Variants (Advanced)

Currently, you can create a product with the variant structure in the database. 

**API Example** (using Postman or similar):
```
POST http://localhost:3001/api/products
{
  "name": "Coca-Cola",
  "barcode": "COK-BASE-001",
  "category": "[paste_category_id_here]",
  "brand": "[paste_brand_id_here]",
  "costPrice": 20,
  "sellingPrice": 40,
  "quantity": 0,
  "hasVariants": true,
  "variants": [
    {
      "size": "250ml",
      "barcode": "COK-250-001",
      "costPrice": 15,
      "sellingPrice": 30,
      "quantity": 50
    },
    {
      "size": "500ml",
      "barcode": "COK-500-001",
      "costPrice": 25,
      "sellingPrice": 50,
      "quantity": 30
    },
    {
      "size": "2L",
      "barcode": "COK-2L-001",
      "costPrice": 50,
      "sellingPrice": 90,
      "quantity": 20
    }
  ]
}
```

---

## ✅ Verification Checklist

### Categories
- [ ] Can create categories
- [ ] Can edit category tax rate
- [ ] Can delete empty category
- [ ] Cannot delete category with products (error shown)
- [ ] Category name shows in product dropdown
- [ ] Category name shows in product table

### Brands
- [ ] Can create brands
- [ ] Can edit brand details
- [ ] Can delete empty brand
- [ ] Cannot delete brand with products (error shown)
- [ ] Email link is clickable
- [ ] Website link opens in new tab
- [ ] Contact info persists after edit

### Products
- [ ] Products load with category names (not IDs)
- [ ] Can create product with category from dropdown
- [ ] Can create product with brand selection
- [ ] Can edit product's category
- [ ] Can edit product's brand
- [ ] Product filtering works
- [ ] Search functionality works

### Authorization
- [ ] Only admins can access Categories page
- [ ] Only admins can access Brands page
- [ ] Non-admin users redirected when trying to access

---

## 🔍 API Endpoints to Test

### Categories API
```bash
# Get all categories
GET http://localhost:3001/api/categories

# Get specific category
GET http://localhost:3001/api/categories/[category_id]

# Create category
POST http://localhost:3001/api/categories
Body: {
  "name": "Snacks",
  "description": "Chips, cookies, etc",
  "defaultTaxRate": 0
}

# Update category
PUT http://localhost:3001/api/categories/[category_id]
Body: {
  "name": "Updated Name",
  "defaultTaxRate": 5
}

# Delete category
DELETE http://localhost:3001/api/categories/[category_id]
```

### Brands API
```bash
# Get all brands
GET http://localhost:3001/api/brands

# Get specific brand
GET http://localhost:3001/api/brands/[brand_id]

# Create brand
POST http://localhost:3001/api/brands
Body: {
  "name": "Sprite",
  "manufacturer": "The Coca-Cola Company",
  "description": "Lemon-lime flavored soft drink",
  "contactInfo": {
    "email": "sprite@cocacola.com",
    "phone": "+1-404-676-2121"
  }
}

# Update brand
PUT http://localhost:3001/api/brands/[brand_id]

# Delete brand
DELETE http://localhost:3001/api/brands/[brand_id]
```

---

## 🎨 UI Features to Test

### Category Management Page
- [ ] Page title and description visible
- [ ] "+ Add Category" button prominent
- [ ] Categories display in nice grid cards
- [ ] Blue left border on cards
- [ ] Hover effect on cards
- [ ] Edit button works
- [ ] Delete button works with confirmation
- [ ] Dialog form validation works
- [ ] Error messages display correctly

### Brand Management Page
- [ ] Page title and description visible
- [ ] "+ Add Brand" button prominent
- [ ] Brands display in nice grid cards
- [ ] Purple left border on cards
- [ ] Contact info visible in cards
- [ ] Email is clickable link
- [ ] Website opens in new tab
- [ ] Hover effect on cards
- [ ] Edit button works
- [ ] Delete button works with confirmation
- [ ] Long contact form scrolls properly in dialog

---

## 🐛 Troubleshooting

### Issue: Categories dropdown empty
**Solution**: 
- Check if categories exist in database
- Verify API is returning data: `GET /api/categories`
- Check browser console for errors

### Issue: Cannot delete category
**Solution**: 
- Category has products assigned - delete products first
- Or category has subcategories - delete subcategories first

### Issue: Product table shows "Uncategorized"
**Solution**:
- Old products in database don't have category reference
- Edit and reassign category to update
- Or create new products

### Issue: Changes not showing
**Solution**:
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Restart backend and frontend

---

## 📊 Database Verification

### Check Categories in MongoDB
```javascript
// In MongoDB shell
db.categories.find()
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "name": "Beverages",
  "description": "All types of drinks",
  "defaultTaxRate": 5,
  "isActive": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

### Check Products with Category Reference
```javascript
// In MongoDB shell
db.products.find().select({name: 1, category: 1, brand: 1})
```

Expected output shows ObjectIds for category and brand:
```json
{
  "_id": ObjectId("..."),
  "name": "Coca-Cola Regular",
  "category": ObjectId("..."),
  "brand": ObjectId("...")
}
```

---

## 🎯 Success Indicators

✅ **You'll know it's working when:**

1. Categories page loads with all your created categories
2. Brands page loads with all your created brands
3. Creating a product shows category and brand dropdowns (not hardcoded lists)
4. Product table displays category names properly
5. No console errors appear
6. Edit/delete operations work with confirmations
7. Navigation between admin pages is smooth
8. Sidebar shows new menu items (Categories, Brands)

---

## 📞 Need Help?

If something isn't working:

1. **Check Backend Logs**: Look at terminal running `npm run dev` in backend
2. **Check Frontend Console**: Press F12 → Console tab
3. **Verify API**: Test endpoints directly with Postman
4. **Check Database**: Verify data in MongoDB
5. **Restart Everything**: Stop and restart both backend and frontend

---

**Happy Testing! 🚀**
