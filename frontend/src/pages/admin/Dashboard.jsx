import { useEffect, useState, useCallback } from "react";
import API from "../../utils/axios";
import PageHelmet from "../../components/PageHelmet";
import Loader from "../../components/Loader";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import authService from "../../services/authService"; // ✅ make sure this can fetch Appwrite JWT

const AdminDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // 🔑 Helper to get headers with Bearer token
  const getAuthHeaders = async () => {
    const token = await authService.getJWT(); // <-- your function that fetches Appwrite JWT
    return { Authorization: `Bearer ${token}` };
  };

  const fetchStats = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();

      const [todayRes, weeklyRes] = await Promise.all([
        API.get("/api/admin/dashboard-stats", { headers }),
        API.get("/api/admin/dashboard-stats/weekly", { headers }),
      ]);

      setStats(todayRes.data.stats || null);
      setWeeklyStats(
        (weeklyRes.data.stats || []).map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }),
          totalUsers: entry.totalUsers,
          totalProducts: entry.totalProducts,
          newUsers: entry.newUsers,
          newProducts: entry.newProducts,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegenerateStats = async () => {
    setRegenerating(true);
    try {
      const headers = await getAuthHeaders();
      await API.post("/api/admin/dashboard-stats/regenerate", {}, { headers });
      await fetchStats();
      alert("Stats regenerated successfully.");
    } catch (err) {
      console.error("Failed to regenerate stats:", err);
      alert("Failed to regenerate stats.");
    } finally {
      setRegenerating(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <Loader />;

  if (!stats) {
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const MetricCard = ({ color, label, value }) => (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full`}
          style={{ backgroundColor: color }}
        ></span>
        <h2 className="text-sm text-gray-500">{label}</h2>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <PageHelmet title="Admin | Dashboard Stats" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          Today's Dashboard Stats
        </h1>
        <button
          onClick={handleRegenerateStats}
          disabled={regenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm disabled:opacity-50"
        >
          {regenerating ? "Regenerating..." : "Regenerate Stats"}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          color="#4f46e5"
          label="Total Users"
          value={stats.totalUsers}
        />
        <MetricCard
          color="#06b6d4"
          label="New Users Today"
          value={stats.newUsers}
        />
        <MetricCard
          color="#16a34a"
          label="Total Products"
          value={stats.totalProducts}
        />
        <MetricCard
          color="#f97316"
          label="New Products Today"
          value={stats.newProducts}
        />
        <MetricCard
          color="#9333ea"
          label="Active Users"
          value={stats.activeUsers || 0}
        />
        <MetricCard
          color="#ec4899"
          label="Total Views"
          value={stats.totalViews || 0}
        />
        <MetricCard
          color="#2563eb"
          label="Most Popular Category"
          value={stats.mostPopularCategory || "N/A"}
        />
      </div>

      {/* Weekly Graph */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
          Last 7 Days Overview
        </h2>
        {weeklyStats.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No weekly data available.
          </p>
        ) : (
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis allowDecimals={false} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    color: "#f9fafb",
                  }}
                  labelStyle={{ color: "#f9fafb" }}
                  itemStyle={{ color: "#f9fafb" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalUsers"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalProducts"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#06b6d4"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="newProducts"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardStats;
