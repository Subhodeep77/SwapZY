// models/index.js or models/AuditModels.js
const mongoose = require("mongoose");

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  actorAppwriteId: { type: String, required: true },
  actorRole: { type: String, enum: ["ADMIN", "USER"], required: true },
  action: { type: String, required: true },
  targetCollection: { type: String, required: true },
  targetId: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

// Admin Dashboard Stat Schema
const adminDashboardStatSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalUsers: { type: Number, default: 0 },
  totalProducts: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  newUsers: { type: Number, default: 0 },
  newProducts: { type: Number, default: 0 },
  totalViews: { type: Number, default: 0 },
  mostPopularCategory: { type: String },
});

// User Activity Log Schema
const userActivityLogSchema = new mongoose.Schema({
  appwriteId: { type: String, required: true },
  activityType: { type: String, required: true },
  productId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

// Admin Action Schema
const adminActionSchema = new mongoose.Schema({
  adminAppwriteId: { type: String, required: true },
  actionType: { type: String, required: true },
  description: { type: String },
  affectedId: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

// Product View Schema
const productViewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  viewerAppwriteId: { type: String, default: null }, // optional for guests
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  viewedAt: { type: Date, default: Date.now },
});

// Index for rate limiting: check recent views by logged-in users
productViewSchema.index({ productId: 1, viewerAppwriteId: 1, viewedAt: 1 });

// Index for rate limiting by IP if viewer is not logged in
productViewSchema.index({ productId: 1, ip: 1, viewedAt: 1 });

// Optional: TTL index to purge old view logs (30 days)
productViewSchema.index(
  { viewedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
); // 30 days

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, default: "INFO" }, // e.g., INFO, WARNING, CRITICAL
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

// ✅ Create model instances
const AuditLog = mongoose.model("AuditLog", auditLogSchema);
const AdminDashboardStat = mongoose.model("AdminDashboardStat",adminDashboardStatSchema);
const UserActivityLog = mongoose.model("UserActivityLog",userActivityLogSchema);
const AdminAction = mongoose.model("AdminAction", adminActionSchema);
const ProductView = mongoose.model("ProductView", productViewSchema);
const Notification = mongoose.model("Notification", notificationSchema);

// ✅ Export them properly
module.exports = {
  AuditLog,
  AdminDashboardStat,
  UserActivityLog,
  AdminAction,
  ProductView,
  Notification,
};
