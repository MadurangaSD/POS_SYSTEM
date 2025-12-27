const express = require("express");
const StockController = require("../controllers/StockController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = express.Router();

// Admin only - stock management
router.post("/adjust", authMiddleware, adminMiddleware, StockController.adjustStock);
router.post("/purchases", authMiddleware, adminMiddleware, StockController.recordPurchase);

// View reports
router.get("/low-stock", authMiddleware, StockController.getLowStock);
router.get("/expiring", authMiddleware, StockController.getExpiring);
router.get("/out-of-stock", authMiddleware, StockController.getOutOfStock);
router.get("/value", authMiddleware, adminMiddleware, StockController.getStockValue);

module.exports = router;
