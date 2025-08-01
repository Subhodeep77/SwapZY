// controllers/admin/dashboardStats.js
const cron = require("node-cron");
const AdminDashboardStat = require("../../models/Admin").AdminDashboardStat;
const Product = require("../../models/Product");
const { users } = require("../../config/appwrite");

// Function to generate daily stats
const generateDailyStats = async () => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Fetch total products
    const totalProducts = await Product.countDocuments();

    // Fetch new products created today
    const newProducts = await Product.countDocuments({
      createdAt: { $gte: dateOnly }
    });

    // Fetch users from Appwrite
    const allUsers = await users.list([], 100); // Fetch max 100 users for now
    const totalUsers = allUsers.total;
    const newUsers = allUsers.users.filter(user => new Date(user.$createdAt) >= dateOnly).length;

    // You can define activeUsers and views tracking logic later as needed
    const activeUsers = 0;
    const totalViews = 0;
    const mostPopularCategory = await getMostPopularCategory();

    // Upsert (insert if not exists or update if exists)
    await AdminDashboardStat.findOneAndUpdate(
      { date: dateOnly },
      {
        totalUsers,
        totalProducts,
        newUsers,
        newProducts,
        activeUsers,
        totalViews,
        mostPopularCategory
      },
      { upsert: true, new: true }
    );

    console.log("✅ Daily admin dashboard stats updated.");
  } catch (error) {
    console.error("❌ Error generating daily stats:", error.message);
  }
};

// Optional helper: get most popular category (basic version)
const getMostPopularCategory = async () => {
  const top = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 1 }
  ]);
  return top[0]?._id || "Unknown";
};

// Schedule the cron job: Run at midnight daily
cron.schedule("0 0 * * *", generateDailyStats);

// Optional: manually fetch today's stat
const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const stats = await AdminDashboardStat.findOne({ date: dateOnly }).lean();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Fetch stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch today's stats" });
  }
};

// controllers/admin/dashboardStats.js (already exported)
const regenerateStatsManually = async (req, res) => {
  try {
    await generateDailyStats();
    res.status(200).json({ success: true, message: "Stats regenerated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to regenerate stats" });
  }
};

const getLast7DaysStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stats = await AdminDashboardStat.find({ date: { $gte: sevenDaysAgo } }).sort({ date: 1 }).lean();
    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Error fetching last 7 days stats:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};



module.exports = {
  generateDailyStats,
  getTodayStats,
  regenerateStatsManually,
  getLast7DaysStats
};
