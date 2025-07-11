// src/controllers/auth.controller.js

async function getProfile(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({
    message: "User profile fetched",
    user: req.user,
  });
}

module.exports = { getProfile };
