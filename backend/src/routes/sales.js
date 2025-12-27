const express = require("express");
const SalesController = require("../controllers/SalesController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Cashier - create sales
router.post("/", authMiddleware, SalesController.create);

// Admin only - reports (define before parameterized routes to avoid conflicts)
router.get("/reports/daily", authMiddleware, adminMiddleware, (req, res, next) => {
  // Default to today if no date provided
  if (!req.query.date) {
    req.query.date = new Date().toISOString().split('T')[0];
  }
  SalesController.getDailyReport(req, res, next);
});
router.get("/reports/top-products", authMiddleware, adminMiddleware, SalesController.getTopProducts);

// All users - view sales
router.get("/", authMiddleware, SalesController.getSalesByDate);
router.get("/:id", authMiddleware, SalesController.getSale);

module.exports = router;
