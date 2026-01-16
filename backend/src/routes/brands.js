const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { authMiddleware } = require('../middlewares/auth');

// Get all active brands
router.get('/', authMiddleware, async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true })
      .sort('name');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get brand by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create brand (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { name, description, manufacturer, logoUrl, contactInfo } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Brand name is required' });
    }

    const brand = new Brand({
      name,
      description,
      manufacturer,
      logoUrl,
      contactInfo: contactInfo || {},
      createdBy: req.user.id,
    });

    await brand.save();
    res.status(201).json(brand);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brand name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update brand (admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json(brand);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Brand name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete brand (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Check if brand has products
    const Product = require('../models/Product');
    const productCount = await Product.countDocuments({ brand: req.params.id });
    
    if (productCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete brand with ${productCount} product(s)` 
      });
    }

    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
