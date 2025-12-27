const StockService = require("../services/StockService");

class StockController {
  static async adjustStock(req, res, next) {
    try {
      const { product_id, quantity, reason } = req.body;

      if (!product_id || quantity === undefined || !reason) {
        return res.status(400).json({ error: "product_id, quantity, and reason required" });
      }

      const adjustment = await StockService.adjustStock(product_id, quantity, reason, req.user.id);
      res.status(201).json(adjustment);
    } catch (error) {
      next(error);
    }
  }

  static async recordPurchase(req, res, next) {
    try {
      const { supplier_name, items } = req.body;

      if (!supplier_name || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "supplier_name and items array required" });
      }

      const purchase = await StockService.recordPurchase(supplier_name, items, req.user.id);
      res.status(201).json(purchase);
    } catch (error) {
      next(error);
    }
  }

  static async getLowStock(req, res, next) {
    try {
      const threshold = req.query.threshold || 10;
      const products = await StockService.getLowStockReport(threshold);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getExpiring(req, res, next) {
    try {
      const daysAhead = req.query.days || 30;
      const products = await StockService.getExpiringProducts(daysAhead);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getOutOfStock(req, res, next) {
    try {
      const products = await StockService.getOutOfStockProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getStockValue(req, res, next) {
    try {
      const value = await StockService.getTotalInventoryValue();
      res.json(value);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StockController;
