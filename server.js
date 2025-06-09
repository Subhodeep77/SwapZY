// src/server.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config");
const { Server } = require("socket.io");
const cluster = require("cluster");
const os = require("os");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const productRoutes = require("./routes/product");
const userRoutes = require("./routes/user");
const wishlistRoutes = require("./routes/wishlist");

dotenv.config();

require("./services/expireOldProduct");
require("./services/cleanUpWishlist");

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL },
});

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Respawn a new worker
  });
} else {
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use((err, req, res, next) => {
    if (
      err instanceof multer.MulterError ||
      err.message === "Only CSV files are allowed!"
    ) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  });

  // TODO: Add your routes here
  app.get("/", (req, res) => res.send("SwapZY backend running"));
  app.use("/api/auth", authRoutes); // /api/auth/login, /api/auth/profile
  app.use("/api/dashboard", dashboardRoutes); // /api/dashboard/stats
  app.use("/api/products", productRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/wishlist", wishlistRoutes);

  // Connect to MongoDB
  connectDB()
    .then(() => {
      httpServer.listen(process.env.PORT || 3000, () => {
        console.log(`Server running on port ${process.env.PORT || 3000}`);
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });

  // Socket.io setup
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    // TODO: Add real-time logic here
  });
}
