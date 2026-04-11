const mockProductFindById = jest.fn();
const mockSaleCreate = jest.fn();
const mockSaleFindById = jest.fn();
const mockSaleFind = jest.fn();
const mockSaleAggregate = jest.fn();
const mockStockAdjustmentCreate = jest.fn();

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

jest.mock("../../src/models/database", () => ({
  Product: {
    findById: mockProductFindById,
  },
  Sale: {
    startSession: jest.fn().mockResolvedValue(mockSession),
    create: mockSaleCreate,
    findById: mockSaleFindById,
    find: mockSaleFind,
    aggregate: mockSaleAggregate,
  },
  StockAdjustment: {
    create: mockStockAdjustmentCreate,
  },
}));

jest.mock("../../src/utils/helpers", () => ({
  generateBillNumber: jest.fn(() => "BILL-TEST-1"),
  roundToTwo: jest.fn((value) => Math.round((value + Number.EPSILON) * 100) / 100),
}));

const SalesService = require("../../src/services/SalesService");

describe("SalesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createSale creates sale and adjusts stock", async () => {
    const save = jest.fn().mockResolvedValue();
    mockProductFindById.mockResolvedValue({
      _id: "p1",
      name: "Coca Cola",
      barcode: "123",
      quantity: 10,
      sellingPrice: 100,
      save,
    });
    mockSaleCreate.mockResolvedValue([
      {
        _id: "sale1",
        billNumber: "BILL-1",
        saleDate: new Date(),
      },
    ]);

    const result = await SalesService.createSale(
      "u1",
      [{ product_id: "p1", quantity: 2 }],
      0,
      "cash",
      500
    );

    expect(save).toHaveBeenCalled();
    expect(mockStockAdjustmentCreate).toHaveBeenCalled();
    expect(result.billNumber).toBe("BILL-1");
    expect(result.total).toBe(200);
  });

  test("createSale rejects insufficient stock", async () => {
    mockProductFindById.mockResolvedValue({
      _id: "p1",
      name: "Coca Cola",
      quantity: 1,
      sellingPrice: 100,
    });

    await expect(
      SalesService.createSale("u1", [{ product_id: "p1", quantity: 5 }], 0, "cash", 500)
    ).rejects.toMatchObject({ status: 400 });
    expect(mockSession.abortTransaction).toHaveBeenCalled();
  });

  test("getSale returns populated sale", async () => {
    const sale = { _id: "s1" };
    mockSaleFindById.mockReturnValue({ populate: jest.fn().mockResolvedValue(sale) });

    const result = await SalesService.getSale("s1");
    expect(result).toEqual(sale);
  });

  test("getDailySalesReport returns aggregates", async () => {
    mockSaleFind.mockResolvedValue([
      { total: 100, paymentMethod: "cash" },
      { total: 50, paymentMethod: "card" },
    ]);

    const report = await SalesService.getDailySalesReport("2026-01-01");

    expect(report.total_bills).toBe(2);
    expect(report.total_sales).toBe(150);
  });

  test("getTopProducts maps aggregate output", async () => {
    mockSaleAggregate.mockResolvedValue([
      {
        _id: "p1",
        productName: "Coca Cola",
        barcode: "123",
        units_sold: 5,
        total_revenue: 500,
        avg_price: 100,
      },
    ]);

    const top = await SalesService.getTopProducts(5, 30);

    expect(top[0].name).toBe("Coca Cola");
    expect(top[0].units_sold).toBe(5);
  });
});
