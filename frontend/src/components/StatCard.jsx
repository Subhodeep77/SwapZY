// src/components/StatCard.jsx
import React from "react";
import { motion } from "framer-motion";
import { IconContext } from "react-icons";
import CountUp from "react-countup";

const MotionDiv = motion.div;

const StatCard = ({ title, value, icon = null, compact = false }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-md hover:shadow-blue-500/20 dark:hover:shadow-blue-400/20 transition-shadow duration-300 w-full flex items-center justify-between ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label={`${title} stat card`}
    >
      <div className="flex flex-col">
        <h3
          className={`${
            compact ? "text-xs" : "text-sm"
          } font-medium text-gray-500 dark:text-gray-400`}
        >
          {title}
        </h3>
        <p
          className={`${
            compact ? "text-xl" : "text-2xl"
          } font-bold text-gray-800 dark:text-white`}
        >
          <CountUp end={value} duration={1} separator="," />
        </p>
      </div>

      {icon && (
        <IconContext.Provider
          value={{
            size: compact ? "1.5rem" : "2rem",
            className: "text-blue-500 dark:text-blue-400",
          }}
        >
          <div aria-hidden="true">{icon}</div>
        </IconContext.Provider>
      )}
    </MotionDiv>
  );
};

export default StatCard;
