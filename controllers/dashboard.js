// dashboard.controller.js

async function getDashboard(req, res) {
  // req.user is available because of verifyAppwriteToken middleware
  try {
    res.json({
      message: `Welcome to your dashboard, ${req.user.name}!`,
      email: req.user.email,
      appwriteId: req.user.appwriteId,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getDashboard };
