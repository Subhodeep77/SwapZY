// src/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const multer = require("multer"); // Needed for error handling

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const wishlistRoutes = require("./routes/wishlist");
const { globalLimiter } = require("./middlewares/rateLimiter");
const adminRoutes = require("./routes/admin");
const orderRoutes = require("./routes/order");

dotenv.config();

// 🔁 Background services
require("./services/expireOldProduct");
require("./services/cleanUpWishlist");
require("./controllers/admin/dashboardStats");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});

app.set("io", io);

// 🔐 Middleware
app.use(globalLimiter);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// 🩺 Health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// 🛑 Multer error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Only CSV files are allowed!") {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// 🔗 Routes
app.get("/", (req, res) => res.send("SwapZY backend running"));
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api/user", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/admin", adminRoutes);
app.use("/order", orderRoutes);

// ⚙️ DB + Server startup
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // ✅ WebSocket setup
    io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      socket.on("join", (chatId) => {
        socket.join(chatId);
      });

      socket.on("TYPING", ({ chatId, userId }) => {
        socket.to(chatId).emit("TYPING", { chatId, userId });
      });

      socket.on("STOP_TYPING", ({ chatId, userId }) => {
        socket.to(chatId).emit("STOP_TYPING", { chatId, userId });
      });

      socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
      });
    });

    // 🔻 Graceful shutdown
    process.on("SIGINT", () => {
      console.log("🛑 Shutting down gracefully...");
      httpServer.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

