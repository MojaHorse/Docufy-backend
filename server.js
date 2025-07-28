const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const uploadRoutes = require("./server/routes/uploadRoutes");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
})); // Frontend URL (Vite)
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/upload", uploadRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
