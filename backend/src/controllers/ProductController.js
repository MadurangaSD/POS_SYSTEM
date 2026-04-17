const ProductService = require("../services/ProductService");
const BarcodeService = require("../services/BarcodeService");

const objectIdPattern = /^[a-fA-F0-9]{24}$/;

class ProductController {
  static normalizeOptionalId(value) {
    if (value === null || value === undefined || value === "" || value === "null") {
      return null;
    }

    if (typeof value === "object" && value !== null) {
      const nestedId = value._id || value.id || "";
      return objectIdPattern.test(String(nestedId)) ? String(nestedId) : null;
    }

    const normalized = String(value).trim();
    return objectIdPattern.test(normalized) ? normalized : null;
  }

  static normalizeOptionalString(value) {
    if (value === null || value === undefined) {
      return undefined;
    }

    const normalized = String(value).trim();
    return normalized ? normalized : undefined;
  }

  static normalizeNumber(value, { integer = false, defaultValue = undefined, fieldName = "value" } = {}) {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }

    const parsed = integer ? Number.parseInt(value, 10) : Number(value);

    if (!Number.isFinite(parsed)) {
      throw { status: 400, message: `${fieldName} must be a valid number` };
    }

    return parsed;
  }

  static async getAll(req, res, next) {
    try {
      const { search, category } = req.query;
      const products = await ProductService.getAll(search, category);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const product = await ProductService.getById(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const payload = { ...req.body };
      payload.barcode = ProductController.normalizeOptionalString(payload.barcode);
      payload.category = ProductController.normalizeOptionalId(payload.category);
      payload.brand = ProductController.normalizeOptionalId(payload.brand);
      payload.sku = ProductController.normalizeOptionalString(payload.sku);
      payload.costPrice = ProductController.normalizeNumber(payload.costPrice, {
        fieldName: "Cost price",
      });
      payload.sellingPrice = ProductController.normalizeNumber(payload.sellingPrice, {
        fieldName: "Selling price",
      });
      payload.quantity = ProductController.normalizeNumber(payload.quantity, {
        integer: true,
        defaultValue: 0,
        fieldName: "Quantity",
      });
      payload.reorderLevel = ProductController.normalizeNumber(payload.reorderLevel, {
        integer: true,
        defaultValue: 10,
        fieldName: "Reorder level",
      });
      payload.wholeSalePrice = ProductController.normalizeNumber(payload.wholeSalePrice, {
        fieldName: "Wholesale price",
      });

      const product = await ProductService.create(payload);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const payload = { ...req.body };
      payload.barcode = ProductController.normalizeOptionalString(payload.barcode);
      payload.category = ProductController.normalizeOptionalId(payload.category);
      payload.brand = ProductController.normalizeOptionalId(payload.brand);
      payload.sku = ProductController.normalizeOptionalString(payload.sku);
      payload.costPrice = ProductController.normalizeNumber(payload.costPrice, {
        fieldName: "Cost price",
      });
      payload.sellingPrice = ProductController.normalizeNumber(payload.sellingPrice, {
        fieldName: "Selling price",
      });
      payload.quantity = ProductController.normalizeNumber(payload.quantity, {
        integer: true,
        defaultValue: 0,
        fieldName: "Quantity",
      });
      payload.reorderLevel = ProductController.normalizeNumber(payload.reorderLevel, {
        integer: true,
        defaultValue: 10,
        fieldName: "Reorder level",
      });
      payload.wholeSalePrice = ProductController.normalizeNumber(payload.wholeSalePrice, {
        fieldName: "Wholesale price",
      });

      const product = await ProductService.update(req.params.id, payload);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await ProductService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getLowStock(req, res, next) {
    try {
      const threshold = req.query.threshold || 10;
      const products = await ProductService.getLowStock(threshold);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getExpiring(req, res, next) {
    try {
      const daysAhead = req.query.days || 30;
      const products = await ProductService.getExpiring(daysAhead);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async lookupBarcode(req, res, next) {
    try {
      const barcode = req.params.barcode;

      // Validate barcode format
      if (!BarcodeService.validateBarcode(barcode)) {
        return res.status(400).json({
          error: "Invalid barcode format. Must be 8, 12, 13, or 14 digits."
        });
      }

      // Check if product already exists in our database
      const existingProduct = await ProductService.getAll(barcode);
      if (existingProduct && existingProduct.length > 0) {
        return res.json({
          found: true,
          existsInDatabase: true,
          product: existingProduct[0],
          message: "Product already exists in your database"
        });
      }

      // Lookup from external APIs
      const productInfo = await BarcodeService.lookupBarcode(barcode);

      res.json({
        found: true,
        existsInDatabase: false,
        product: productInfo,
        message: `Product found via ${productInfo.source}`
      });
    } catch (error) {
      if (error.status === 404) {
        return res.status(404).json({
          found: false,
          error: error.message || "Product not found in barcode databases"
        });
      }
      next(error);
    }
  }
}

module.exports = ProductController;
