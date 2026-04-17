const mongoose = require('mongoose');

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
    default: undefined,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,
    trim: true,
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
      unique: true,
      sparse: true,
      default: undefined,
      trim: true,
    },
    description: String,
    imageUrl: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null,
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
      default: undefined,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);