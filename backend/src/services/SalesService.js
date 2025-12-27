const { Sale, Product, StockAdjustment } = require("../models/database");
const { generateBillNumber, roundToTwo } = require("../utils/helpers");
const ProductService = require("./ProductService");

class SalesService {
  static async createSale(userId, items, discount = 0, paymentMethod, cashReceived = null) {
    const session = await Sale.startSession();
    session.startTransaction();

    try {
      const billNumber = generateBillNumber();
      let subtotal = 0;
      const saleItems = [];

      // Validate and process items
      for (const item of items) {
        const product = await Product.findById(item.product_id);

        if (!product) {
          throw { status: 404, message: "Product not found" };
        }

        // Check stock availability
        if (product.quantity < item.quantity) {
          throw {
            status: 400,
            message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
          };
        }

        const lineTotal = roundToTwo(product.sellingPrice * item.quantity);
        subtotal = roundToTwo(subtotal + lineTotal);

        saleItems.push({
          product: product._id,
          productName: product.name,
          barcode: product.barcode,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
          lineTotal,
        });

        // Decrement stock
        product.quantity -= item.quantity;
        await product.save({ session });

        // Log stock adjustment
        await StockAdjustment.create(
          [
            {
              product: product._id,
              productName: product.name,
              barcode: product.barcode,
              quantityAdjusted: -item.quantity,
              quantityBefore: product.quantity + item.quantity,
              quantityAfter: product.quantity,
              reason: "sale",
              adjustedBy: userId,
            },
          ],
          { session }
        );
      }

      // Calculate totals
      const tax = 0;
      const total = roundToTwo(subtotal - discount + tax);
      const change = cashReceived ? roundToTwo(cashReceived - total) : 0;

      // Create sale
      const sale = await Sale.create(
        [
          {
            billNumber,
            items: saleItems,
            subtotal,
            discountPercent: 0,
            discountAmount: discount,
            taxPercent: 0,
            taxAmount: tax,
            total,
            paymentMethod,
            amountReceived: cashReceived,
            change,
            cashier: userId,
          },
        ],
        { session }
      );

      await session.commitTransaction();
      return {
        id: sale[0]._id,
        billNumber: sale[0].billNumber,
        items: saleItems,
        subtotal,
        discount,
        tax,
        total,
        paymentMethod,
        amountReceived: cashReceived,
        change,
        saleDate: sale[0].saleDate,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getSale(saleId) {
    const sale = await Sale.findById(saleId).populate("items.product");

    if (!sale) {
      throw { status: 404, message: "Sale not found" };
    }

    return sale;
  }

  static async getSalesByDate(startDate, endDate = null) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(startDate);

    return await Sale.find({
      saleDate: { $gte: start, $lte: end },
    })
      .populate("items.product")
      .sort({ saleDate: -1 });
  }

  static async getDailySalesReport(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      saleDate: { $gte: startDate, $lte: endDate },
    });

    if (sales.length === 0) {
      return {
        total_bills: 0,
        total_sales: 0,
        cash_sales: 0,
        card_sales: 0,
        qr_sales: 0,
        average_bill: 0,
        min_bill: 0,
        max_bill: 0,
      };
    }

    const totals = sales.reduce(
      (acc, sale) => {
        acc.total_bills += 1;
        acc.total_sales += sale.total;
        if (sale.paymentMethod === "cash") acc.cash_sales += sale.total;
        if (sale.paymentMethod === "card") acc.card_sales += sale.total;
        if (sale.paymentMethod === "qr") acc.qr_sales += sale.total;
        return acc;
      },
      {
        total_bills: 0,
        total_sales: 0,
        cash_sales: 0,
        card_sales: 0,
        qr_sales: 0,
      }
    );

    const amounts = sales.map((s) => s.total).sort((a, b) => a - b);

    return {
      ...totals,
      average_bill: roundToTwo(totals.total_sales / totals.total_bills),
      min_bill: amounts[0],
      max_bill: amounts[amounts.length - 1],
    };
  }

  static async getTopProducts(limit = 5, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.productName" },
          barcode: { $first: "$items.barcode" },
          units_sold: { $sum: "$items.quantity" },
          total_revenue: { $sum: "$items.lineTotal" },
          avg_price: { $avg: "$items.unitPrice" },
        },
      },
      { $sort: { units_sold: -1 } },
      { $limit: limit },
    ]);

    return result.map((r) => ({
      id: r._id,
      name: r.productName,
      barcode: r.barcode,
      units_sold: r.units_sold,
      total_revenue: roundToTwo(r.total_revenue),
      avg_price: roundToTwo(r.avg_price),
    }));
  }
}

module.exports = SalesService;
