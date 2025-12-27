const ProductService = require("../../src/services/ProductService");
const { getDatabase, initializeDatabase, seedDatabase } = require("../../src/models/database");

// Setup and teardown
beforeAll(() => {
  initializeDatabase();
  seedDatabase();
});

describe("ProductService", () => {
  describe("getAll", () => {
    test("should return all products", () => {
      const products = ProductService.getAll();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    test("should search products by name", () => {
      const products = ProductService.getAll("Coca");
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].name).toContain("Coca");
    });

    test("should filter by category", () => {
      const products = ProductService.getAll("", "Beverages");
      expect(products.length).toBeGreaterThan(0);
      products.forEach((p) => expect(p.category).toBe("Beverages"));
    });
  });

  describe("getById", () => {
    test("should return product by id", () => {
      const products = ProductService.getAll();
      const product = ProductService.getById(products[0].id);
      expect(product).toBeDefined();
      expect(product.id).toBe(products[0].id);
    });

    test("should throw error for invalid id", () => {
      expect(() => {
        ProductService.getById("invalid-id");
      }).toThrow();
    });
  });

  describe("getByBarcode", () => {
    test("should return product by barcode", () => {
      const product = ProductService.getByBarcode("8851234567890");
      expect(product).toBeDefined();
      expect(product.barcode).toBe("8851234567890");
    });

    test("should throw error for invalid barcode", () => {
      expect(() => {
        ProductService.getByBarcode("invalid-barcode");
      }).toThrow();
    });
  });

  describe("create", () => {
    test("should create a new product", () => {
      const newProduct = ProductService.create({
        name: "Test Product",
        barcode: "TEST-BARCODE-123",
        cost_price: 100,
        selling_price: 150,
        category: "Test",
        stock_quantity: 10,
      });

      expect(newProduct).toBeDefined();
      expect(newProduct.name).toBe("Test Product");
      expect(newProduct.barcode).toBe("TEST-BARCODE-123");
    });

    test("should throw error for duplicate barcode", () => {
      expect(() => {
        ProductService.create({
          name: "Duplicate Barcode Product",
          barcode: "8851234567890",
          cost_price: 100,
          selling_price: 150,
        });
      }).toThrow();
    });

    test("should throw error for missing required fields", () => {
      expect(() => {
        ProductService.create({
          name: "Missing Price",
          barcode: "TEST-123",
        });
      }).toThrow();
    });
  });

  describe("update", () => {
    test("should update product", () => {
      const products = ProductService.getAll();
      const original = products[0];

      const updated = ProductService.update(original.id, {
        selling_price: 999,
      });

      expect(updated.selling_price).toBe(999);
    });
  });

  describe("getLowStock", () => {
    test("should return low stock products", () => {
      const lowStock = ProductService.getLowStock(50);
      expect(Array.isArray(lowStock)).toBe(true);
    });
  });
});
