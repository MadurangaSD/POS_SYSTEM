const SalesService = require("../../src/services/SalesService");
const ProductService = require("../../src/services/ProductService");
const { initializeDatabase, seedDatabase } = require("../../src/models/database");

beforeAll(() => {
  initializeDatabase();
  seedDatabase();
});

describe("SalesService", () => {
  let testUserId = "test-user-123";
  let testProduct;

  beforeAll(() => {
    testProduct = ProductService.getAll()[0];
  });

  describe("createSale", () => {
    test("should create a sale and decrement stock", () => {
      const originalStock = testProduct.stock_quantity;

      const sale = SalesService.createSale(
        testUserId,
        [
          {
            product_id: testProduct.id,
            quantity: 5,
          },
        ],
        0,
        "cash",
        1000
      );

      expect(sale).toBeDefined();
      expect(sale.id).toBeDefined();
      expect(sale.bill_number).toBeDefined();
      expect(sale.items.length).toBe(1);
      expect(sale.total).toBeGreaterThan(0);

      // Verify stock was decremented
      const updatedProduct = ProductService.getById(testProduct.id);
      expect(updatedProduct.stock_quantity).toBe(originalStock - 5);
    });

    test("should throw error if stock is insufficient", () => {
      expect(() => {
        SalesService.createSale(
          testUserId,
          [
            {
              product_id: testProduct.id,
              quantity: 10000, // More than available
            },
          ],
          0,
          "cash"
        );
      }).toThrow();
    });

    test("should calculate change for cash payments", () => {
      const sale = SalesService.createSale(
        testUserId,
        [
          {
            product_id: testProduct.id,
            quantity: 1,
          },
        ],
        0,
        "cash",
        500
      );

      expect(sale.change).toBeDefined();
      expect(sale.change).toBe(500 - sale.total);
    });
  });

  describe("getSale", () => {
    test("should retrieve sale by id", () => {
      const sale = SalesService.createSale(
        testUserId,
        [
          {
            product_id: testProduct.id,
            quantity: 2,
          },
        ],
        0,
        "card"
      );

      const retrieved = SalesService.getSale(sale.id);
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(sale.id);
      expect(retrieved.items).toBeDefined();
    });

    test("should throw error for non-existent sale", () => {
      expect(() => {
        SalesService.getSale("non-existent-id");
      }).toThrow();
    });
  });

  describe("getDailySalesReport", () => {
    test("should get daily sales report", () => {
      const today = new Date().toISOString().split("T")[0];
      const report = SalesService.getDailySalesReport(today);

      expect(report).toBeDefined();
      expect(report.total_bills).toBeDefined();
      expect(report.total_sales).toBeDefined();
    });
  });

  describe("getTopProducts", () => {
    test("should get top products", () => {
      const topProducts = SalesService.getTopProducts(5);
      expect(Array.isArray(topProducts)).toBe(true);
    });
  });
});
