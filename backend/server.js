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
const chatRoutes = require("./routes/chat");
const webhookRoutes = require("./routes/webhook");
const paymentRoutes = require("./routes/payment");
const validateChatAccess = require("./middlewares/validateChatAccess");
const registerOrderExpiryCron = require("./services/expireUnpaidOrders")
const scheduleProductExpiry = require("./services/expireOldProduct");
const { registerAutoCompleteCron } = require("./controllers/order");


dotenv.config();

// 🔁 Background services
require("./services/cleanUpWishlist");
require("./controllers/admin/dashboardStats");


const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});

app.set("io", io);
registerOrderExpiryCron(io);
scheduleProductExpiry(io);
registerAutoCompleteCron(io);

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
app.use("/chat", chatRoutes);
app.use("/webhook", webhookRoutes);
app.use("/payment", paymentRoutes);

// ⚙️ DB + Server startup
// ...[unchanged imports and config setup above]...

// ⚙️ DB + Server startup
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // ✅ WebSocket setup with JOIN/LEAVE and validation
    io.on("connection", (socket) => {
      console.log("🟢 User connected:", socket.id);

      // JOIN_CHAT with validation and user tracking
      socket.on("JOIN_CHAT", async ({ chatId, userId }) => {
        try {
          await validateChatAccess(chatId, userId);
          socket.data.userId = userId; // Store userId for later use
          socket.join(chatId);
          socket.emit("JOINED_CHAT", { chatId });
        } catch (error) {
          socket.emit("JOIN_ERROR", { error: error.message });
        }
      });

      // LEAVE_CHAT
      socket.on("LEAVE_CHAT", ({ chatId }) => {
        socket.leave(chatId);
        socket.emit("LEFT_CHAT", { chatId });
      });

      // TYPING
      socket.on("TYPING", ({ chatId }) => {
        const userId = socket.data.userId;
        if (userId) {
          socket.to(chatId).emit("TYPING", { chatId, userId });
        }
      });

      // STOP_TYPING
      socket.on("STOP_TYPING", ({ chatId }) => {
        const userId = socket.data.userId;
        if (userId) {
          socket.to(chatId).emit("STOP_TYPING", { chatId, userId });
        }
      });

      // SEND_MESSAGE
      socket.on("SEND_MESSAGE", async (data) => {
        const userId = socket.data.userId;
        try {
          await validateChatAccess(data.chatId, userId);
          // Proceed to save and emit message
        } catch (error) {
          socket.emit("SEND_ERROR", { error: error.message });
        }
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
