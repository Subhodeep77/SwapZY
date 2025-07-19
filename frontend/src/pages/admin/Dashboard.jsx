import { useEffect, useState } from "react";
import axios from "axios";
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
  ResponsiveContainer
} from "recharts";

const AdminDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchStats = async () => {
    try {
      const [todayRes, weeklyRes] = await Promise.all([
        axios.get("/api/admin/dashboard-stats"),
        axios.get("/api/admin/dashboard-stats/weekly"),
      ]);

      setStats(todayRes.data.stats || null);
      setWeeklyStats(
        (weeklyRes.data.stats || []).map((entry) => ({
          date: new Date(entry.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short"
          }),
          totalUsers: entry.totalUsers,
          totalProducts: entry.totalProducts,
          newUsers: entry.newUsers,
          newProducts: entry.newProducts
        }))
      );
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateStats = async () => {
    setRegenerating(true);
    try {
      await axios.post("/api/admin/dashboard-stats/regenerate");
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
  }, []);

  if (loading) return <Loader />;

  if (!stats) {
    return (
      <div className="text-red-500 text-center mt-10">
        Failed to load dashboard statistics.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-10">
      <PageHelmet title="Admin | Dashboard Stats" />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Today's Dashboard Stats</h1>
        <button
          onClick={handleRegenerateStats}
          disabled={regenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {regenerating ? "Regenerating..." : "Regenerate Stats"}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">Total Users</h2>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">New Users Today</h2>
          <p className="text-2xl font-bold">{stats.newUsers}</p>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">Total Products</h2>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">New Products Today</h2>
          <p className="text-2xl font-bold">{stats.newProducts}</p>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">Active Users</h2>
          <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
        </div>

        <div className="border rounded p-4">
          <h2 className="text-sm text-gray-500">Total Views</h2>
          <p className="text-2xl font-bold">{stats.totalViews || 0}</p>
        </div>

        <div className="border rounded p-4 col-span-1 sm:col-span-2">
          <h2 className="text-sm text-gray-500">Most Popular Category</h2>
          <p className="text-2xl font-bold text-blue-600">
            {stats.mostPopularCategory || "N/A"}
          </p>
        </div>
      </div>

      {/* Weekly Graph */}
      <div className="border rounded p-6">
        <h2 className="text-lg font-semibold mb-4 text-center">Last 7 Days Overview</h2>
        {weeklyStats.length === 0 ? (
          <p className="text-center text-gray-500">No weekly data available.</p>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalUsers" stroke="#8884d8" />
                <Line type="monotone" dataKey="totalProducts" stroke="#82ca9d" />
                <Line type="monotone" dataKey="newUsers" stroke="#00c1d4" />
                <Line type="monotone" dataKey="newProducts" stroke="#ff8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardStats;
