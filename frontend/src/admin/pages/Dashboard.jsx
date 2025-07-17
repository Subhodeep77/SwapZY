import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  PackageCheck,
  Activity,
  FileDown,
  RotateCcw
} from "lucide-react";
import authService from "@/services/authService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [orderChart, setOrderChart] = useState([]);
  const [productChart, setProductChart] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityPage, setActivityPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const jwt = await authService.getJWT();
        if (!jwt) throw new Error("User not authenticated");

        const [todayRes, weeklyRes, orderRes, productRes, activityRes] = await Promise.all([
          fetch("/api/admin/dashboard-stats", {
            headers: { Authorization: `Bearer ${jwt}` },
          }),
          fetch("/api/admin/dashboard-stats/weekly", {
            headers: { Authorization: `Bearer ${jwt}` },
          }),
          fetch("/api/admin/dashboard-stats/orders", {
            headers: { Authorization: `Bearer ${jwt}` },
          }),
          fetch("/api/admin/dashboard-stats/products", {
            headers: { Authorization: `Bearer ${jwt}` },
          }),
          fetch("/api/admin/dashboard-stats/recent?page=${activityPage}", {
            headers: { Authorization: `Bearer ${jwt}` },
          }),
        ]);

        const todayData = await todayRes.json();
        const weeklyData = await weeklyRes.json();
        const orderData = await orderRes.json();
        const productData = await productRes.json();
        const activityData = await activityRes.json();

        if (todayData.success) setStats(todayData.stats);
        if (weeklyData.success) setWeeklyStats(weeklyData.stats);
        if (orderData.success) setOrderChart(orderData.stats);
        if (productData.success) setProductChart(productData.stats);
        if (activityData.success) setRecentActivity(activityData.logs);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activityPage]);

  const metricCards = [
    {
      title: "Total Users",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      value: stats?.totalUsers,
    },
    {
      title: "Total Products",
      icon: <PackageCheck className="w-5 h-5 text-green-600" />,
      value: stats?.totalProducts,
    },
    {
      title: "Total Orders",
      icon: <BarChart3 className="w-5 h-5 text-yellow-600" />,
      value: stats?.totalOrders,
    },
    {
      title: "Total Activities",
      icon: <Activity className="w-5 h-5 text-red-600" />,
      value: stats?.totalActivities,
    },
  ];

  const handleExport = () => {
    window.open("/api/admin/dashboard-stats/export", "_blank");
  };

  const handleRegenerate = async () => {
    const jwt = await authService.getJWT();
    await fetch("/api/admin/dashboard-stats/regenerate", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    window.location.reload();
  };

  return (
    <div className="p-4 md:p-8">
      <Helmet>
        <title>Admin Dashboard | SwapZY</title>
        <meta
          name="description"
          content="Admin analytics and monitoring dashboard for SwapZY."
        />
      </Helmet>

      <h1 className="text-2xl md:text-3xl font-bold mb-6">📊 Admin Dashboard</h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <FileDown size={18} /> Export CSV
        </button>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
        >
          <RotateCcw size={18} /> Regenerate Stats
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading statistics...</p>
      ) : stats ? (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {metricCards.map((card, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-semibold">{card.value ?? 0}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow mb-8"
          >
            <h2 className="text-lg font-semibold mb-4">📈 Weekly User Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="activities" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">📦 Orders Chart</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={orderChart}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold mb-4">📦 Product Uploads</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={productChart}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="products" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow mt-8">
            <h2 className="text-lg font-semibold mb-4">📜 Recent Activities</h2>
            <ul className="space-y-2 text-sm">
              {recentActivity?.map((log, idx) => (
                <li key={idx} className="border-b py-2">
                  <span className="font-medium">{log.user}</span> — {log.action}
                  <span className="text-gray-400 ml-2">({log.timestamp})</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between">
              <button
                disabled={activityPage === 1}
                onClick={() => setActivityPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setActivityPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <p className="text-red-500">Failed to load stats. Please try again later.</p>
      )}
    </div>
  );
};

export default Dashboard;
