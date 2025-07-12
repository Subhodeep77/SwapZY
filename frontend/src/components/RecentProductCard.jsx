// src/components/RecentProductCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const MotionDiv = motion.div;

const RecentProductCard = ({ product }) => {
  const imageSrc = product.imageUrl || product.image || "/placeholder-product.png";

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      aria-label={`Product: ${product.title}`}
    >
      <Link to={`/product/${product._id}`} className="block">
        <img
          src={imageSrc}
          alt={product.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-1 line-clamp-2">
            {product.description}
          </p>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex justify-between">
            <span className="font-medium">₹{product.price}</span>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              {product.status}
            </span>
          </div>
        </div>
      </Link>
    </MotionDiv>
  );
};

export default RecentProductCard;
