const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  barcode: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0,
  },
});

const saleSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [saleItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'qr', 'cheque', 'credit'],
      required: true,
    },
    amountReceived: {
      type: Number,
      min: 0,
    },
    change: {
      type: Number,
      default: 0,
      min: 0,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'refunded', 'cancelled'],
      default: 'completed',
    },
    notes: String,
    saleDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for searching by date
saleSchema.index({ saleDate: -1 });

module.exports = mongoose.model('Sale', saleSchema);
