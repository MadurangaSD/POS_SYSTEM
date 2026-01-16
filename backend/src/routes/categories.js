const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authMiddleware } = require('../middlewares/auth');

// Get all active categories
router.get('/', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name')
      .sort('name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID with subcategories
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name');
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subcategories = await Category.find({
      parentCategory: req.params.id,
      isActive: true,
    }).sort('name');

    res.json({ category, subcategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { name, description, parentCategory, defaultTaxRate } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = new Category({
      name,
      description,
      parentCategory: parentCategory || null,
      defaultTaxRate: defaultTaxRate || 0,
      createdBy: req.user.id,
    });

    await category.save();
    await category.populate('parentCategory', 'name');

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update category (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ category: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${productCount} product(s)` 
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ 
      parentCategory: req.params.id 
    });
    
    if (subcategoryCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category with ${subcategoryCount} subcategory(ies)` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
