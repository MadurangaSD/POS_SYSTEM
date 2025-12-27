const mongoose = require('mongoose');

const stockAdjustmentSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: String,
    barcode: String,
    quantityAdjusted: {
      type: Number,
      required: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    quantityAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      enum: ['restock', 'damage', 'expired', 'manual_adjust', 'purchase', 'return'],
      required: true,
    },
    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: String,
    costImpact: {
      type: Number,
      default: 0,
    },
    referenceDoc: String, // Invoice, Bill, etc
  },
  { timestamps: true }
);

// Index for product tracking
stockAdjustmentSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('StockAdjustment', stockAdjustmentSchema);
