// src/components/ProductStatsCard.jsx
import { motion } from "framer-motion";

const MotionSec = motion.section;

const StatItem = ({ label, value }) => (
  <div className="flex flex-col items-center px-2 py-3">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">
      {value}
    </p>
  </div>
);

const ProductStatsCard = ({ stats }) => {
  return (
    <MotionSec
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-md p-4 w-full hover:shadow-blue-500/20" 
      aria-labelledby="product-stats-heading"
    >
      <h2
        id="product-stats-heading"
        className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100"
      >
        📊 Product Statistics
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatItem label="Total Products" value={stats.total} />
        <StatItem label="Available" value={stats.available} />
        <StatItem label="Sold" value={stats.sold} />
        <StatItem label="Expired" value={stats.expired} />
        <StatItem label="Total Views" value={stats.views} />
      </div>
    </MotionSec>
  );
};

export default ProductStatsCard;
