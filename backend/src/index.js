require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./models/database");
const { errorHandler } = require("./middlewares/auth");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const salesRoutes = require("./routes/sales");
const stockRoutes = require("./routes/stock");
const categoryRoutes = require("./routes/categories");
const brandRoutes = require("./routes/brands");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "POS Backend API running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server with MongoDB connection
if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 POS Backend API running on http://localhost:${PORT}`);
        console.log("📚 API Documentation: See API_DOCUMENTATION.md");
      });
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB:", error);
      process.exit(1);
    });
}

module.exports = app;
