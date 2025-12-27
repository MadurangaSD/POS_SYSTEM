const { Product, StockAdjustment, Purchase } = require("../models/database");
const ProductService = require("./ProductService");

class StockService {
  static async adjustStock(productId, quantity, reason, userId) {
    const product = await Product.findById(productId);

    if (!product) {
      throw { status: 404, message: "Product not found" };
    }

    // Validate adjustment
    const newStock = product.quantity + quantity;
    if (newStock < 0) {
      throw { status: 400, message: "Cannot reduce stock below zero" };
    }

    const adjustment = await StockAdjustment.create({
      product: productId,
      productName: product.name,
      barcode: product.barcode,
      quantityAdjusted: quantity,
      quantityBefore: product.quantity,
      quantityAfter: newStock,
      reason,
      adjustedBy: userId,
    });

    product.quantity = newStock;
    await product.save();

    return {
      id: adjustment._id,
      product_id: productId,
      quantity_change: quantity,
      new_stock: newStock,
      reason,
    };
  }

  static async recordPurchase(supplierId, items, userId) {
    const session = await Purchase.startSession();
    session.startTransaction();

    try {
      let totalAmount = 0;
      const purchaseItems = [];

      // Validate items
      for (const item of items) {
        const product = await Product.findById(item.product_id);

        if (!product) {
          throw { status: 404, message: "Product not found" };
        }

        if (!item.quantity || item.quantity <= 0 || !item.cost_price || item.cost_price <= 0) {
          throw { status: 400, message: "Invalid item data" };
        }

        const lineTotal = item.cost_price * item.quantity;
        totalAmount += lineTotal;

        purchaseItems.push({
          product: product._id,
          productName: product.name,
          barcode: product.barcode,
          quantity: item.quantity,
          costPrice: item.cost_price,
          lineTotal,
        });

        // Update product cost price
        product.costPrice = item.cost_price;
        product.quantity += item.quantity;
        await product.save({ session });

        // Log adjustment
        await StockAdjustment.create(
          [
            {
              product: product._id,
              productName: product.name,
              barcode: product.barcode,
              quantityAdjusted: item.quantity,
              quantityBefore: product.quantity - item.quantity,
              quantityAfter: product.quantity,
              reason: "purchase",
              adjustedBy: userId,
            },
          ],
          { session }
        );
      }

      // Create purchase record
      const invoiceNumber = `PO-${Date.now()}`;
      const purchase = await Purchase.create(
        [
          {
            invoiceNumber,
            supplier: supplierId,
            items: purchaseItems,
            subtotal: totalAmount,
            tax: 0,
            total: totalAmount,
            receivedBy: userId,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return {
        id: purchase[0]._id,
        supplier_name: supplierId,
        total_amount: totalAmount,
        items_count: items.length,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getLowStockReport(threshold = 10) {
    return await Product.find({
      quantity: { $lte: threshold },
    }).sort({ quantity: 1 });
  }

  static async getExpiringProducts(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Product.find({
      expiryDate: {
        $exists: true,
        $ne: null,
        $lte: futureDate,
      },
    }).sort({ expiryDate: 1 });
  }

  static async getOutOfStockProducts() {
    return await Product.find({ quantity: 0 });
  }

  static async getTotalInventoryValue() {
    const products = await Product.find({ isActive: true });

    const total = products.reduce((sum, product) => {
      return sum + product.quantity * product.costPrice;
    }, 0);

    return {
      total_value: total.toFixed(2),
      total_products: products.length,
      total_units: products.reduce((sum, p) => sum + p.quantity, 0),
    };
  }
}

module.exports = StockService;
