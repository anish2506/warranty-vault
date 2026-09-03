require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const ocrRoutes = require("./routes/ocrRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const {
  initWarrantyCron,
  checkWarrantyExpirations,
} = require("./services/warrantyCron");

dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize daily warranty cron scheduler (Runs once on startup)
initWarrantyCron();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

app.post("/api/internal/warranty-check", async (req, res) => {
  if (!process.env.CRON_SECRET || req.get("x-cron-secret") !== process.env.CRON_SECRET) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = await checkWarrantyExpirations();
  return res.status(result.success ? 200 : 500).json(result);
});

app.get("/", (req, res) => {
  res.json({
    message: "WarrantyVault API is running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});