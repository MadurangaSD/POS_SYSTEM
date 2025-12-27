const { Product } = require("../models/database");

class ProductService {
  static async getAll(search = "", category = "") {
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    return await Product.find(query).sort({ name: 1 });
  }

  static async getById(id) {
    const product = await Product.findById(id);

    if (!product) {
      throw { status: 404, message: "Product not found" };
    }

    return product;
  }

  static async getByBarcode(barcode) {
    const product = await Product.findOne({ barcode });

    if (!product) {
      throw { status: 404, message: "Product not found" };
    }

    return product;
  }

  static async create(data) {
    // Validate required fields
    if (!data.name || !data.barcode || !data.costPrice || !data.sellingPrice) {
      throw { status: 400, message: "Missing required fields" };
    }

    // Check barcode uniqueness
    const existing = await Product.findOne({ barcode: data.barcode });
    if (existing) {
      throw { status: 400, message: "Barcode already exists" };
    }

    const product = new Product(data);
    await product.save();
    return product;
  }

  static async update(id, data) {
    const product = await this.getById(id); // Verify exists

    // Check barcode uniqueness if updating barcode
    if (data.barcode && data.barcode !== product.barcode) {
      const existing = await Product.findOne({ barcode: data.barcode });
      if (existing) {
        throw { status: 400, message: "Barcode already exists" };
      }
    }

    Object.assign(product, data);
    await product.save();
    return product;
  }

  static async delete(id) {
    await this.getById(id); // Verify exists

    await Product.findByIdAndDelete(id);
    return { message: "Product deleted" };
  }

  static async getLowStock(threshold = 10) {
    return await Product.find({ quantity: { $lte: threshold } }).sort({ quantity: 1 });
  }

  static async getExpiring(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return await Product.find({
      expiryDate: {
        $exists: true,
        $ne: null,
        $lte: futureDate,
      },
    }).sort({ expiryDate: 1 });
  }
}

module.exports = ProductService;
