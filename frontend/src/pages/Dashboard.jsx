// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import authService from "../appwrite/authService";
import axios from "axios";
import Loader from "../components/Loader";
import ProfileCard from "../components/ProfileCard";
import ProductStatsCard from "../components/ProductStatsCard";
import RecentProductCard from "../components/RecentProductCard";
import WishlistCard from "../components/WishlistCard";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import StatCard from "../components/StatCard";
import { Helmet } from "react-helmet";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    document.title = "Dashboard | SwapZY";
    const meta = document.querySelector("meta[name='description']");
    if (meta) {
      meta.setAttribute(
        "content",
        "Track your products, orders, and wishlist - all from one dashboard."
      );
    }

    const fetchDashboard = async () => {
      try {
        const token = await authService.getJWT();
        const res = await axios.get("/api/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDashboardData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <Loader />;
  if (!dashboardData)
    return <div className="text-center py-10">Failed to load dashboard</div>;

  const { user, productStats, wishlistStats } = dashboardData;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Helmet>
        <title>My Dashboard | SwapZY</title>
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Welcome back, {user.name}!</h1>

      {/* Profile Overview */}
      <ProfileCard user={user} />

      {/* Product Stats Card */}
      <div className="mt-6">
        <ProductStatsCard stats={productStats} />
      </div>

      {/* Wishlist Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Wishlisted By You" value={wishlistStats.totalWishlistedByUser} />
      </div>

      {/* Views & Category Breakdown */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard title="Total Views" value={productStats.views} />
        <CategoryBreakdownChart data={productStats.categoryBreakdown} />
      </div>

      {/* Most Wishlisted Product Owned */}
      {wishlistStats.mostWishlistedOwnedProduct && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-3">🔥 Most Wishlisted Product You Own</h2>
          <RecentProductCard product={wishlistStats.mostWishlistedOwnedProduct} />
        </div>
      )}

      {/* Recent Uploads */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Uploads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {productStats.recentUploads.map((product) => (
            <RecentProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      {/* Wishlist Activity */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recently Wishlisted</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistStats.recentWishlist.map((entry) => (
            <WishlistCard key={entry._id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
