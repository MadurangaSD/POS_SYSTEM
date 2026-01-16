# Developer Reference Guide

## 🔧 Architecture & Code Structure

### Backend File Organization

```
backend/src/
├── models/
│   ├── Category.js ............. Category schema (NEW)
│   ├── Brand.js ................ Brand schema (NEW)
│   ├── Product.js .............. Product schema (UPDATED)
│   ├── Sale.js
│   ├── User.js
│   ├── Purchase.js
│   ├── StockAdjustment.js
│   └── database.js
├── routes/
│   ├── categories.js ........... Category endpoints (NEW)
│   ├── brands.js ............... Brand endpoints (NEW)
│   ├── products.js ............. Product endpoints
│   ├── sales.js
│   ├── stock.js
│   └── auth.js
├── controllers/
│   ├── ProductController.js .... (No changes needed)
│   └── ...
├── services/
│   ├── ProductService.js ....... (Compatible)
│   └── ...
├── middlewares/
│   └── auth.js ................. (Used for authorization)
└── index.js .................... Main server file (UPDATED)
```

### Frontend File Organization

```
frontend/src/
├── pages/admin/
│   ├── CategoriesPage.jsx ....... NEW
│   ├── BrandsPage.jsx ........... NEW
│   ├── ProductsPage.jsx ......... UPDATED
│   └── ...other pages...
├── components/
│   ├── Sidebar.jsx .............. UPDATED
│   └── ...other components...
├── App.jsx ...................... UPDATED
├── services/
│   └── api.js ................... (Uses existing services)
└── ...other files...
```

---

## 📖 Code Examples

### Backend - Creating a Category

**Controller Pattern** (if you want to organize further):
```javascript
// backend/src/controllers/CategoryController.js
const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      defaultTaxRate: req.body.defaultTaxRate || 0,
      createdBy: req.user.id,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};
```

### Frontend - Using Category API

**React Component Pattern**:
```javascript
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

function CategoriesComponent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name, tax) => {
    try {
      await api.post('/api/categories', {
        name,
        defaultTaxRate: tax,
      });
      toast.success('Category created');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error);
    }
  };

  return (
    // JSX here
  );
}
```

---

## 🔗 Database Relationships

### Product → Category (Many-to-One)
```javascript
// Product has ONE category
product.category => Category._id

// Populate category details:
await Product.findById(id).populate('category');
// Returns: { ..., category: { _id, name, description, ... }, ... }
```

### Product → Brand (Many-to-One)
```javascript
// Product has optional brand
product.brand => Brand._id (optional)

// Populate brand details:
await Product.findById(id).populate('brand');
// Returns: { ..., brand: { _id, name, manufacturer, ... }, ... }
```

### Category → SubCategories (Parent-Child)
```javascript
// Category can have parent
category.parentCategory => Category._id (optional)

// Find subcategories:
const subcats = await Category.find({
  parentCategory: parentCategoryId
});
```

---

## 🚀 API Implementation Details

### Error Handling Pattern

```javascript
// Standard error responses:

// 400 - Bad Request (validation error)
res.status(400).json({ 
  error: 'Invalid input: Category name is required' 
});

// 403 - Forbidden (authorization error)
res.status(403).json({ 
  error: 'Unauthorized. Admin access required.' 
});

// 404 - Not Found
res.status(404).json({ 
  error: 'Category not found' 
});

// 500 - Server Error
res.status(500).json({ 
  error: error.message 
});
```

### Authorization Pattern

```javascript
// Check admin role
const isAdmin = req.user.role === 'admin';

// In routes:
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  // Continue with operation
});
```

### Data Validation Pattern

```javascript
// Validate before operation
if (!req.body.name || !req.body.name.trim()) {
  return res.status(400).json({ 
    error: 'Category name is required' 
  });
}

// Check for conflicts
const existing = await Category.findOne({ name: req.body.name });
if (existing) {
  return res.status(400).json({ 
    error: 'Category name already exists' 
  });
}

// Check dependencies before delete
const count = await Product.countDocuments({ 
  category: req.params.id 
});
if (count > 0) {
  return res.status(400).json({ 
    error: `Cannot delete. ${count} products use this category` 
  });
}
```

---

## 🎨 Frontend Implementation Details

### State Management Pattern

```javascript
// Multiple state hooks for organization
const [categories, setCategories] = useState([]);
const [brands, setBrands] = useState([]);
const [loading, setLoading] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [formData, setFormData] = useState({
  name: '',
  description: '',
});

// Separate fetch functions
const loadCategories = async () => { /* ... */ };
const loadBrands = async () => { /* ... */ };

// Combined initial load
useEffect(() => {
  loadCategories();
  loadBrands();
}, []);
```

### Form Handling Pattern

```javascript
// Form state management
const [formData, setFormData] = useState({
  name: '',
  email: '',
  website: '',
});

// Handle field changes
const handleChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    [field]: value
  }));
};

// Handle nested objects
const handleContactChange = (field, value) => {
  setFormData(prev => ({
    ...prev,
    contactInfo: {
      ...prev.contactInfo,
      [field]: value
    }
  }));
};

// Submit handler
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate
  if (!formData.name.trim()) {
    toast.error('Name is required');
    return;
  }

  try {
    // Save
    if (editingId) {
      await api.put(`/api/categories/${editingId}`, formData);
    } else {
      await api.post('/api/categories', formData);
    }
    
    // Reset
    setFormData({ name: '', email: '', website: '' });
    
    // Refresh
    loadCategories();
  } catch (error) {
    toast.error(error.response?.data?.error);
  }
};
```

### Dialog/Modal Pattern

```javascript
// Dialog state
const [isOpen, setIsOpen] = useState(false);
const [editingId, setEditingId] = useState(null);

// Open for create
const handleCreate = () => {
  setFormData({ name: '', description: '' });
  setEditingId(null);
  setIsOpen(true);
};

// Open for edit
const handleEdit = (item) => {
  setFormData(item);
  setEditingId(item._id);
  setIsOpen(true);
};

// Close dialog
const handleClose = () => {
  setIsOpen(false);
  setFormData({ name: '', description: '' });
  setEditingId(null);
};

// Render dialog
return (
  <>
    {isOpen && (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Dialog content */}
      </Dialog>
    )}
  </>
);
```

---

## 🧪 Testing Patterns

### Manual Testing Checklist

```javascript
// For each CRUD operation:
1. Create
   - [ ] POST with valid data → 201 response
   - [ ] POST without required field → 400 response
   - [ ] POST duplicate name → 400 response
   - [ ] POST as non-admin → 403 response

2. Read
   - [ ] GET all → 200 with array
   - [ ] GET by ID → 200 with object
   - [ ] GET non-existent → 404 response

3. Update
   - [ ] PUT with valid data → 200 response
   - [ ] PUT partial data → 200 updates only changed fields
   - [ ] PUT as non-admin → 403 response

4. Delete
   - [ ] DELETE empty item → 200 response
   - [ ] DELETE with dependencies → 400 response
   - [ ] DELETE as non-admin → 403 response
```

### API Testing Commands

```bash
# Create
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{"name":"Beverages","defaultTaxRate":5}'

# Read
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer [token]"

# Update
curl -X PUT http://localhost:3001/api/categories/[id] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [token]" \
  -d '{"name":"Updated Name"}'

# Delete
curl -X DELETE http://localhost:3001/api/categories/[id] \
  -H "Authorization: Bearer [token]"
```

---

## 📊 Performance Considerations

### Database Indexing

```javascript
// Already implemented indexes:
// - Category.name (unique)
// - Brand.name (unique)
// - Product.barcode (unique)
// - Product.category (for queries)
// - Product.brand (for queries)

// Consider adding for large datasets:
categorySchema.index({ isActive: 1 });
brandSchema.index({ isActive: 1 });
productSchema.index({ category: 1, brand: 1 });
```

### Query Optimization

```javascript
// Good: Populate related data
await Product.find()
  .populate('category', 'name defaultTaxRate')
  .populate('brand', 'name');

// Bad: Multiple queries
const products = await Product.find();
for (let p of products) {
  p.category = await Category.findById(p.category);
}
```

### Caching Opportunities

```javascript
// Categories and brands rarely change
// Consider frontend caching:
const useCategories = () => {
  const [categories, setCategories] = useState(
    () => JSON.parse(localStorage.getItem('categories')) || []
  );
  
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await api.get('/api/categories');
      setCategories(data);
      localStorage.setItem('categories', JSON.stringify(data));
    };
    
    fetchCategories();
  }, []);
  
  return categories;
};
```

---

## 🔄 Common Modifications

### Add New Field to Category

1. **Update Model**:
```javascript
// backend/src/models/Category.js
categorySchema.add({
  color: { type: String, default: '#0000FF' }
});
```

2. **Update Form**:
```javascript
// frontend/.../CategoriesPage.jsx
<input 
  type="color" 
  value={formData.color}
  onChange={(e) => setFormData({...formData, color: e.target.value})}
/>
```

3. **Update API** (usually no changes needed if route is generic)

### Add New Endpoint

1. **Add to Route**:
```javascript
// backend/src/routes/categories.js
router.get('/by-name/:name', authenticateToken, async (req, res) => {
  const category = await Category.findOne({ name: req.params.name });
  res.json(category);
});
```

2. **Use in Frontend**:
```javascript
const response = await api.get(`/api/categories/by-name/${name}`);
```

### Change Authorization

1. **Update Route Middleware**:
```javascript
// From admin-only
if (req.user.role !== 'admin') { /* ... */ }

// To admin and manager
if (!['admin', 'manager'].includes(req.user.role)) { /* ... */ }

// Or remove for public
// Just remove the check
```

---

## 🐛 Common Issues & Solutions

### Issue: Category dropdown not loading
**Check**:
- [ ] API endpoint working: `GET /api/categories`
- [ ] Browser console for errors
- [ ] Network tab in DevTools
- [ ] Database has categories

**Solution**:
```javascript
// Add debugging
useEffect(() => {
  loadCategories();
}, []);

const loadCategories = async () => {
  console.log('Loading categories...');
  try {
    const response = await api.get('/api/categories');
    console.log('Categories:', response.data);
    setCategories(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Issue: Cannot delete category
**Check**:
- [ ] Are there products with this category?
- [ ] Are there subcategories?
- [ ] Check error message returned

**Solution**: Reassign products first or delete subcategories

### Issue: Changes not persisting
**Check**:
- [ ] Is data being sent to API?
- [ ] Is database being updated?
- [ ] Is frontend refreshing?

**Solution**:
```javascript
// Verify data sent
const handleSubmit = async () => {
  console.log('Submitting:', formData);
  const response = await api.post('/api/categories', formData);
  console.log('Response:', response.data);
  // Then refresh
  await loadCategories();
};
```

---

## 📚 Additional Resources

### Related Code Files
- `backend/src/middlewares/auth.js` - Authentication middleware
- `frontend/src/services/api.js` - API service wrapper
- `backend/src/models/database.js` - MongoDB connection

### Similar Implementations
- Product routes - Follow same pattern for CRUD
- User management - Similar authorization checks
- Stock management - Similar database relationships

---

## 🎯 Best Practices Applied

✅ **RESTful API Design** - Standard HTTP methods and status codes
✅ **Error Handling** - Try-catch blocks and user-friendly messages
✅ **Authorization** - Role-based access control
✅ **Data Validation** - Input validation before operations
✅ **Database Integrity** - Prevent orphaned data
✅ **Component Reusability** - Card components for categories and brands
✅ **State Management** - Clear separation of concerns
✅ **User Feedback** - Toast notifications for all actions

---

**Happy Coding! 🚀**
