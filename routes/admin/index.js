const express = require("express");
const router = express.Router();

router.use("/audit-logs", require("./auditLogs"));
router.use("/dashboard-stats", require("./dashboardStats"));
router.use("/user-activities", require("./userActivityLog"));
router.use("/admin-actions", require("./adminAction"));
router.use("/product-views", require("./productView"));
router.use("/users", require("./userManagement"));
router.use("/admin-login-log", require("./adminLoginLog"));
router.use("/notifications", require("./notifications"));

console.log('Loaded admin routes');

module.exports = router;
