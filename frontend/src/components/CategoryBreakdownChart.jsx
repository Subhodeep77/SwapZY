// src/components/CategoryBreakdownCard.jsx
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Optional preset color map for known categories
const CATEGORY_COLOR_MAP = {
  Electronics: "#8884d8",
  Books: "#82ca9d",
  Fashion: "#ffc658",
  Furniture: "#ff7f50",
  Stationery: "#00c49f",
  Uncategorized: "#ffbb28",
};

// Dynamic fallback color generator using HSL
const generateColor = (index) => `hsl(${(index * 67) % 360}, 65%, 60%)`;

const MotionDiv = motion.div;

const CategoryBreakdownChart = ({ data }) => {
  const chartData = data.map((item) => ({
    name: item._id || "Uncategorized",
    value: item.count,
  }));

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-md w-full"
      aria-label="Product categories breakdown"
    >
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        🧩 Category Breakdown
      </h2>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            dataKey="value"
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name }) => name}
          >
            {chartData.map((entry, index) => {
              const color =
                CATEGORY_COLOR_MAP[entry.name] || generateColor(index);
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              borderColor: "#ccc",
              color: "#333",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        {chartData.map((entry, index) => {
          const color = CATEGORY_COLOR_MAP[entry.name] || generateColor(index);
          return (
            <div key={entry.name} className="flex items-center space-x-2">
              <span
                className="inline-block w-3 h-3 rounded-full border border-white dark:border-gray-800"
                style={{ backgroundColor: color }}
              ></span>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {entry.name} ({entry.value})
              </span>
            </div>
          );
        })}
      </div>
    </MotionDiv>
  );
};

export default CategoryBreakdownChart;
