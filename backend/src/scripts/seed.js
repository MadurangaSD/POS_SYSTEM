require('dotenv').config();
const mongoose = require('mongoose');
const { User, Product } = require('../models/database');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✓ Connected for seeding');

  try {
    // Seed users
    const adminUsername = process.env.SEED_ADMIN_USER || 'admin';
    const adminPassword = process.env.SEED_ADMIN_PASS || 'admin123';
    const cashierUsername = process.env.SEED_CASHIER_USER || 'cashier';
    const cashierPassword = process.env.SEED_CASHIER_PASS || 'cashier123';

    const [admin] = await User.find({ username: adminUsername }).limit(1);
    if (!admin) {
      await User.create({ username: adminUsername, password: adminPassword, role: 'admin' });
      console.log(`✓ Admin user created: ${adminUsername}/${adminPassword}`);
    } else {
      console.log(`• Admin user exists: ${adminUsername}`);
    }

    const [cashier] = await User.find({ username: cashierUsername }).limit(1);
    if (!cashier) {
      await User.create({ username: cashierUsername, password: cashierPassword, role: 'cashier' });
      console.log(`✓ Cashier user created: ${cashierUsername}/${cashierPassword}`);
    } else {
      console.log(`• Cashier user exists: ${cashierUsername}`);
    }

    // Seed products
    const sample = [
      { name: 'Coca Cola 500ml', barcode: '8901234500001', category: 'beverages', costPrice: 80, sellingPrice: 120, quantity: 50, reorderLevel: 10 },
      { name: 'Milk 1L', barcode: '8901234500002', category: 'dairy', costPrice: 180, sellingPrice: 230, quantity: 40, reorderLevel: 8 },
      { name: 'Biscuit Pack', barcode: '8901234500003', category: 'snacks', costPrice: 45, sellingPrice: 70, quantity: 100, reorderLevel: 20 },
      { name: 'Rice 5kg', barcode: '8901234500004', category: 'grains', costPrice: 450, sellingPrice: 520, quantity: 30, reorderLevel: 5 },
    ];

    for (const p of sample) {
      const exists = await Product.findOne({ barcode: p.barcode });
      if (!exists) {
        await Product.create(p);
        console.log(`✓ Product added: ${p.name}`);
      } else {
        console.log(`• Product exists: ${p.name}`);
      }
    }

    console.log('✓ Seeding complete');
  } catch (err) {
    console.error('Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('✓ Disconnected');
  }
}

main();
