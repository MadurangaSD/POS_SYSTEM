const mongoose = require('mongoose');

// Variant schema for product variations (sizes, colors, etc.)
const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: [true, 'Variant size is required'],
  },
  color: String,
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
  barcode: {
    type: String,
    unique: true,
    required: [true, 'Variant barcode is required'],
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0,
  },
  images: [String],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    barcode: {
      type: String,
      required: [true, 'Base barcode is required'],
      trim: true,
    },
    description: String,
    imageUrl: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
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
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],
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
