const SalesService = require("../services/SalesService");

class SalesController {
  static async create(req, res, next) {
    try {
      const { items, discount, payment_method, cash_received } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Items array required" });
      }

      if (!payment_method) {
        return res.status(400).json({ error: "Payment method required" });
      }

      const sale = await SalesService.createSale(req.user.id, items, discount || 0, payment_method, cash_received);

      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  }

  static async getSale(req, res, next) {
    try {
      const sale = await SalesService.getSale(req.params.id);
      res.json(sale);
    } catch (error) {
      next(error);
    }
  }

  static async getSalesByDate(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date) {
        return res.status(400).json({ error: "start_date query parameter required" });
      }

      const sales = await SalesService.getSalesByDate(start_date, end_date);
      res.json(sales);
    } catch (error) {
      next(error);
    }
  }

  static async getDailyReport(req, res, next) {
    try {
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: "date query parameter required" });
      }

      const report = await SalesService.getDailySalesReport(date);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  static async getTopProducts(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const days = parseInt(req.query.days) || 30;

      const products = await SalesService.getTopProducts(limit, days);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SalesController;
