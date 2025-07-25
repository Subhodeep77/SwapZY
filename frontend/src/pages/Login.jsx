// src/pages/Login.jsx
import authService from "../services/authService";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import PageHelmet from "../components/PageHelmet";
import mascotImg from "../assets/swapzy_mascot.png"; // ✅ make sure this path is correct

const MotionDiv = motion.div;

const Login = () => {
  const handleLogin = () => {
    authService.loginWithGoogle(); // redirects
  };

  return (
    <>
      <PageHelmet
        title="Login"
        description="Login to your SwapZY dashboard using your Google account and start exploring products near your campus!"
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 max-w-5xl w-full">
          {/* Mascot image on left */}
          <motion.img
            src={mascotImg}
            alt="SwapZY Mascot"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="hidden md:block w-80 h-auto drop-shadow-xl"
          />

          {/* Login Card */}
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg max-w-sm w-full text-center"
          >
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Welcome to SwapZY 🚀
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sign in with your student Google account to continue
            </p>

            <button
              onClick={handleLogin}
              className="flex items-center justify-center gap-3 px-5 py-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <FcGoogle size={22} />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Sign in with Google
              </span>
            </button>
          </MotionDiv>
        </div>
      </div>
    </>
  );
};

export default Login;
