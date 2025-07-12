// src/components/WishlistCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

const MotionDiv = motion.div;

const WishlistCard = ({ entry }) => {
  const { product, addedAt } = entry;
  if (!product) return null;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-900 shadow-md rounded-2xl overflow-hidden"
      aria-label={`Wishlisted product: ${product.title}`}
    >
      <Link
        to={`/product/${product._id}`}
        className="block hover:opacity-90 transition"
      >
        <img
          src={product.imageUrl || "/placeholder-product.png"}
          alt={product.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className="p-3">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            📂 {product.category}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Wishlisted {formatDistanceToNow(new Date(addedAt))} ago
          </p>
        </div>
      </Link>
    </MotionDiv>
  );
};

export default WishlistCard;
