const mockProductFind = jest.fn();
const mockProductFindById = jest.fn();
const mockProductFindOne = jest.fn();
const mockProductFindByIdAndDelete = jest.fn();

const MockProduct = jest.fn().mockImplementation((data) => ({
  ...data,
  _id: "new-product-id",
  save: jest.fn().mockResolvedValue(),
}));

MockProduct.find = mockProductFind;
MockProduct.findById = mockProductFindById;
MockProduct.findOne = mockProductFindOne;
MockProduct.findByIdAndDelete = mockProductFindByIdAndDelete;

jest.mock("../../src/models/database", () => ({
  Product: MockProduct,
}));

const ProductService = require("../../src/services/ProductService");

describe("ProductService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAll returns products", async () => {
    const products = [{ _id: "p1", name: "Coca Cola" }];
    const sort = jest.fn().mockResolvedValue(products);
    mockProductFind.mockReturnValue({ sort });

    const result = await ProductService.getAll();

    expect(mockProductFind).toHaveBeenCalledWith({});
    expect(sort).toHaveBeenCalledWith({ name: 1 });
    expect(result).toEqual(products);
  });

  test("getAll applies search and category filters", async () => {
    const sort = jest.fn().mockResolvedValue([]);
    mockProductFind.mockReturnValue({ sort });

    await ProductService.getAll("coca", "cat-1");

    expect(mockProductFind).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "coca", $options: "i" } },
        { barcode: { $regex: "coca", $options: "i" } },
      ],
      category: "cat-1",
    });
  });

  test("getById throws on missing product", async () => {
    mockProductFindById.mockResolvedValue(null);
    await expect(ProductService.getById("missing")).rejects.toMatchObject({ status: 404 });
  });

  test("create validates required fields", async () => {
    await expect(ProductService.create({ name: "No prices" })).rejects.toMatchObject({ status: 400 });
  });

  test("create prevents duplicate barcode", async () => {
    mockProductFindOne.mockResolvedValue({ _id: "existing" });
    await expect(
      ProductService.create({ name: "Test", barcode: "123", costPrice: 10, sellingPrice: 20 })
    ).rejects.toMatchObject({ status: 400 });
  });

  test("update saves product", async () => {
    const save = jest.fn().mockResolvedValue();
    const existingProduct = { _id: "p1", barcode: "b1", save, name: "Old" };
    mockProductFindById.mockResolvedValue(existingProduct);
    mockProductFindOne.mockResolvedValue(null);

    const result = await ProductService.update("p1", { name: "New" });

    expect(save).toHaveBeenCalled();
    expect(result.name).toBe("New");
  });

  test("delete removes product", async () => {
    mockProductFindById.mockResolvedValue({ _id: "p1" });
    mockProductFindByIdAndDelete.mockResolvedValue({});

    const result = await ProductService.delete("p1");

    expect(mockProductFindByIdAndDelete).toHaveBeenCalledWith("p1");
    expect(result).toEqual({ message: "Product deleted" });
  });
});
