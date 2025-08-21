// src/components/ProfileCard.jsx
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";

const MotionDiv = motion.div;

const ProfileCard = ({ user }) => {
  console.log("User:", user);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-md 
           p-6 w-full border border-gray-200 dark:border-gray-700 max-w-full"
      >
      {/* Edit button */}
      <a
        href="/profile/init"
        className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 
                   dark:text-gray-400 dark:hover:text-blue-400 transition"
      >
        <Pencil size={18} />
      </a>

      {/* Profile info */}
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt="User Avatar"
          className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600"
        />
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {user.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🎓 {user.college}
          </p>
        </div>
      </div>
    </MotionDiv>
  );
};

export default ProfileCard;
