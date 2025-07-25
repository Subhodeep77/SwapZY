import { useEffect, useState } from "react";
import authService from "../services/authService";
import axios from "axios";
import Loader from "../components/Loader";
import ProfileCard from "../components/ProfileCard";
import ProductStatsCard from "../components/ProductStatsCard";
import RecentProductCard from "../components/RecentProductCard";
import WishlistCard from "../components/WishlistCard";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import StatCard from "../components/StatCard";
import PageHelmet from "../components/PageHelmet";
import mascotImg from "../assets/swapzy_mascot.png"; // ✅ Ensure image exists

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
      <PageHelmet
        title="Dashboard"
        description="Track your products, orders, and wishlist - all from one dashboard."
      />

      <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>

      {/* 👋 Mascot Welcome */}
      <div className="mb-8 flex items-center gap-6">
        <img
          src={mascotImg}
          alt="SwapZY Mascot"
          className="hidden md:block w-24 h-auto drop-shadow-md"
        />
        <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-xl text-sm text-gray-800 dark:text-gray-200 shadow">
          👋 Hey {user.name.split(" ")[0]}! Here's your dashboard summary.
        </div>
      </div>

      {/* Profile Overview */}
      <ProfileCard user={user} />

      {/* Product Stats */}
      <div className="mt-6">
        <ProductStatsCard stats={productStats} />
      </div>

      {/* Wishlist Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Wishlisted By You"
          value={wishlistStats.totalWishlistedByUser}
        />
      </div>

      {/* Views & Category Breakdown */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard title="Total Views" value={productStats.views} />
        <CategoryBreakdownChart data={productStats.categoryBreakdown} />
      </div>

      {/* Most Wishlisted Product Owned */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">
          🔥 Most Wishlisted Product You Own
        </h2>
        {wishlistStats.mostWishlistedOwnedProduct ? (
          <RecentProductCard
            product={wishlistStats.mostWishlistedOwnedProduct}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-300">
            <img
              src={mascotImg}
              alt="No popular product yet"
              className="w-28 h-auto mb-3"
            />
            <p className="text-sm">
              You haven’t had any highly wishlisted products yet. Keep listing
              great stuff! 🛍️
            </p>
          </div>
        )}
      </div>

      {/* Recent Uploads */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recent Uploads</h2>
        {productStats.recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productStats.recentUploads.map((product) => (
              <RecentProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-300 py-8">
            <img
              src={mascotImg}
              alt="No uploads"
              className="w-28 h-auto mb-3"
            />
            <p className="text-sm">
              You haven’t uploaded anything yet 🐿️
              <br />
              Let’s get started by adding your first product!
            </p>
          </div>
        )}
      </div>

      {/* Wishlist Activity */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-3">Recently Wishlisted</h2>
        {wishlistStats.recentWishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlistStats.recentWishlist.map((entry) => (
              <WishlistCard key={entry._id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-300 py-8">
            <img
              src={mascotImg}
              alt="No wishlist activity"
              className="w-28 h-auto mb-3"
            />
            <p className="text-sm">
              Your wishlist is empty 🐿️
              <br />
              Browse products and start adding your favorites!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
