const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
    },
    barcode: {
      type: String,
      required: [true, 'Barcode is required'],
      unique: true,
      trim: true,
    },
    description: String,
    imageUrl: String,
    category: {
      type: String,
      enum: [
        'beverages', 'snacks', 'groceries', 'dairy', 'meat', 'vegetables', 'fruits',
        'bakery', 'frozen', 'household', 'grains', 'spices', 'food', 'other'
      ],
      default: 'other',
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    wholeSalePrice: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    expiryDate: Date,
    supplier: String,
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for name search
productSchema.index({ name: 'text' });

module.exports = mongoose.model('Product', productSchema);
