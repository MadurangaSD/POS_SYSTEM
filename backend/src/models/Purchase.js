const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema({
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
  costPrice: {
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

const purchaseSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: {
      type: String,
      required: true,
    },
    items: [purchaseItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'partial', 'delivered'],
      default: 'pending',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    expectedDelivery: Date,
    deliveredDate: Date,
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: String,
  },
  { timestamps: true }
);

// Index for supplier and date
purchaseSchema.index({ supplier: 1, purchaseDate: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
