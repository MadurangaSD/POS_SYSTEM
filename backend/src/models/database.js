const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const Sale = require('./Sale');
const StockAdjustment = require('./StockAdjustment');
const Purchase = require('./Purchase');

// Connection string from environment
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}`);

    // Initialize database with seed data
    await initializeDatabase();
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

function getDatabase() {
  // For MongoDB, we return mongoose connection
  return mongoose.connection;
}

// Initialize database with seed data
const initializeDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();

    if (userCount === 0) {
      console.warn('⚠ No users found. Create at least one user before logging in.');
    }

    if (productCount === 0) {
      console.warn('⚠ No products found. Add products through your management flow.');
    }

    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
  }
};

function seedDatabase() {
  // Seeding is now handled in initializeDatabase
  console.log('Database seeding handled by initializeDatabase');
}

// Disconnect from MongoDB
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error.message);
    process.exit(1);
  }
};

function closeDatabase() {
  // Handled by disconnectDB
};

module.exports = {
  connectDB,
  disconnectDB,
  getDatabase,
  initializeDatabase,
  seedDatabase,
  closeDatabase,
  // Models
  User,
  Product,
  Sale,
  StockAdjustment,
  Purchase,
};
