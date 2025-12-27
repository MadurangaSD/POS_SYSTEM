const ProductService = require("../services/ProductService");
const BarcodeService = require("../services/BarcodeService");

class ProductController {
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
      const product = await ProductService.create(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
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
