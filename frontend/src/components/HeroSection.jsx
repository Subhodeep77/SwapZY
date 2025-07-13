import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import mascot from "../assets/swapzy_mascot.png"; // SwapZY mascot image
const MotionImg = motion.img;

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10">
        
        {/* Text Section */}
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            Buy, Sell & Swap <br /> Locally on Campus
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
            Trusted by thousands of students — discover deals near your college,
            connect instantly, and save big. Powered by verified student logins only.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl shadow transition-all duration-300"
            aria-label="Start exploring products near you"
          >
            🚀 Start Exploring
          </Link>
        </div>

        {/* Animated Mascot */}
        <MotionImg 
          src={mascot}
          alt="SwapZY Mascot smiling and walking"
          loading="lazy"
          width="320"
          height="320"
          className="w-72 md:w-80 h-auto mx-auto drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.95, y: 0 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0], // Infinite vertical bounce
          }}
          transition={{
            opacity: { duration: 0.6 },
            scale: { duration: 0.6 },
            y: {
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
