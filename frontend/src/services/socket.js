// src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("⚠️ Socket error:", err.message);
    });
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    console.log("🔌 Forcing socket disconnect...");
    socket.disconnect();
    socket.close(); // <== try this as well
    socket = null;
  }
};

export const getSocket = () => socket;
