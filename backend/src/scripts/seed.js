require('dotenv').config();
const mongoose = require('mongoose');
const { User, Product } = require('../models/database');
const Category = require('../models/Category');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.info('✓ Connected for seeding');

  try {
    // Seed users
    const adminUsername = process.env.SEED_ADMIN_USER || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASS || 'admin123';
    const cashierUsername = process.env.SEED_CASHIER_USER || 'cashier';
    const cashierPassword = process.env.SEED_CASHIER_PASS || 'cashier123';

    // Handle admin user - create or update password
    let admin = await User.findOne({ username: adminUsername });
    if (!admin) {
      admin = await User.create({ username: adminUsername, password: adminPassword, role: 'admin' });
      console.info(`✓ Admin user created: ${adminUsername}`);
    } else {
      // Reset password to ensure it matches SEED_ADMIN_PASS
      admin.password = adminPassword;
      await admin.save();
      console.info(`✓ Admin password reset: ${adminUsername}`);
    }

    // Handle cashier user - create or update password
    let cashier = await User.findOne({ username: cashierUsername });
    if (!cashier) {
      cashier = await User.create({ username: cashierUsername, password: cashierPassword, role: 'cashier' });
      console.info(`✓ Cashier user created: ${cashierUsername}`);
    } else {
      // Reset password to ensure it matches SEED_CASHIER_PASS
      cashier.password = cashierPassword;
      await cashier.save();
      console.info(`✓ Cashier password reset: ${cashierUsername}`);
    }

    // Seed products
    const categoryNames = ['beverages', 'dairy', 'snacks', 'grains'];
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        const existing = await Category.findOne({ name });
        if (existing) return existing;
        return Category.create({ name });
      })
    );
    const categoryMap = categories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    const sample = [
      { name: 'Coca Cola 500ml', barcode: '8901234500001', category: 'beverages', costPrice: 80, sellingPrice: 120, quantity: 50, reorderLevel: 10 },
      { name: 'Milk 1L', barcode: '8901234500002', category: 'dairy', costPrice: 180, sellingPrice: 230, quantity: 40, reorderLevel: 8 },
      { name: 'Biscuit Pack', barcode: '8901234500003', category: 'snacks', costPrice: 45, sellingPrice: 70, quantity: 100, reorderLevel: 20 },
      { name: 'Rice 5kg', barcode: '8901234500004', category: 'grains', costPrice: 450, sellingPrice: 520, quantity: 30, reorderLevel: 5 },
    ];

    for (const p of sample) {
      const exists = await Product.findOne({ barcode: p.barcode });
      if (!exists) {
        await Product.create({ ...p, category: categoryMap[p.category] });
        console.info(`✓ Product added: ${p.name}`);
      } else {
        console.info(`• Product exists: ${p.name}`);
      }
    }

    console.info('✓ Seeding complete');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.info('✓ Disconnected');
  }
}

main();
