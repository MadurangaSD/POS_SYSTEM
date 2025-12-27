const express = require("express");
const ProductController = require("../controllers/ProductController");
const { authMiddleware, adminMiddleware } = require("../middlewares/auth");

const router = express.Router();
// Barcode lookup (admin only - for adding new products)
router.get("/lookup/:barcode", authMiddleware, adminMiddleware, ProductController.lookupBarcode);


// Public product search (cashiers need this)
router.get("/", authMiddleware, ProductController.getAll);
router.get("/low-stock", authMiddleware, ProductController.getLowStock);
router.get("/expiring", authMiddleware, ProductController.getExpiring);
router.get("/:id", authMiddleware, ProductController.getById);

// Admin only - create/update/delete
router.post("/", authMiddleware, adminMiddleware, ProductController.create);
router.put("/:id", authMiddleware, adminMiddleware, ProductController.update);
router.delete("/:id", authMiddleware, adminMiddleware, ProductController.delete);

module.exports = router;
