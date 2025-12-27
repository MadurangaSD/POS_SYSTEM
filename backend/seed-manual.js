require("dotenv").config();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
});

const User = mongoose.model("User", userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  barcode: String,
  category: String,
  costPrice: Number,
  sellingPrice: Number,
  wholeSalePrice: Number,
  quantity: Number,
  reorderLevel: Number,
  expiryDate: Date,
  supplier: String,
  sku: String,
  isActive: Boolean,
});

const Product = mongoose.model("Product", productSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Check if users already exist
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`✓ Database already has ${userCount} users`);
    } else {
      // Create users with pre-hashed passwords
      const adminPassword = await bcryptjs.hash("admin", 10);
      const cashierPassword = await bcryptjs.hash("cashier", 10);

      await User.create([
        {
          username: "admin",
          password: adminPassword,
          role: "admin",
          isActive: true,
        },
        {
          username: "cashier",
          password: cashierPassword,
          role: "cashier",
          isActive: true,
        },
      ]);
      console.log("✓ Users created");
    }

    // Check if products already exist
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log(`✓ Database already has ${productCount} products`);
    } else {
      // Seed products
      await Product.insertMany([
        {
          name: "Coca Cola",
          barcode: "4900590001807",
          category: "beverages",
          costPrice: 25,
          sellingPrice: 50,
          wholeSalePrice: 45,
          quantity: 100,
          reorderLevel: 20,
          supplier: "Coca Cola Company",
          sku: "COKE-001",
          isActive: true,
        },
        {
          name: "Bread",
          barcode: "1234567890123",
          category: "food",
          costPrice: 20,
          sellingPrice: 40,
          wholeSalePrice: 35,
          quantity: 80,
          reorderLevel: 30,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          supplier: "Local Bakery",
          sku: "BREAD-001",
          isActive: true,
        },
        {
          name: "Milk",
          barcode: "8718215168876",
          category: "dairy",
          costPrice: 60,
          sellingPrice: 90,
          wholeSalePrice: 80,
          quantity: 50,
          reorderLevel: 15,
          expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          supplier: "Dairy Farms Ltd",
          sku: "MILK-001",
          isActive: true,
        },
        {
          name: "Rice",
          barcode: "1234567890124",
          category: "food",
          costPrice: 80,
          sellingPrice: 120,
          wholeSalePrice: 110,
          quantity: 200,
          reorderLevel: 50,
          supplier: "Rice Mills",
          sku: "RICE-001",
          isActive: true,
        },
        {
          name: "Eggs (Dozen)",
          barcode: "6289012345678",
          category: "dairy",
          costPrice: 150,
          sellingPrice: 250,
          wholeSalePrice: 230,
          quantity: 40,
          reorderLevel: 10,
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          supplier: "Farm Fresh",
          sku: "EGGS-001",
          isActive: true,
        },
        {
          name: "Chicken (1kg)",
          barcode: "5901234123457",
          category: "food",
          costPrice: 350,
          sellingPrice: 550,
          wholeSalePrice: 500,
          quantity: 30,
          reorderLevel: 10,
          expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          supplier: "Poultry Farm",
          sku: "CHICK-001",
          isActive: true,
        },
        {
          name: "Potato (1kg)",
          barcode: "1234567890125",
          category: "vegetables",
          costPrice: 30,
          sellingPrice: 60,
          wholeSalePrice: 50,
          quantity: 150,
          reorderLevel: 40,
          supplier: "Vegetable Market",
          sku: "POT-001",
          isActive: true,
        },
        {
          name: "Tomato (1kg)",
          barcode: "1234567890126",
          category: "vegetables",
          costPrice: 40,
          sellingPrice: 80,
          wholeSalePrice: 70,
          quantity: 120,
          reorderLevel: 30,
          supplier: "Vegetable Market",
          sku: "TOM-001",
          isActive: true,
        },
      ]);
      console.log("✓ Products seeded");
    }

    console.log("\n✅ Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
