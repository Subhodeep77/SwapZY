// src/components/ProfileCard.jsx
import React from "react";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

const ProfileCard = ({ user }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-md p-4 w-full"
    >
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover border"
        />
        <div>
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">🎓 {user.college}</p>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ProfileCard;
